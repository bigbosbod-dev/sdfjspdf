// Meal analysis with the Claude API (vision + structured JSON output).
// The SDK is loaded on demand so the rest of the app works offline.

const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.0.0/+esm";
const MODEL = "claude-opus-5-5";

let clientPromise = null;
let clientKey = null;
async function getClient(apiKey) {
  if (!clientPromise || clientKey !== apiKey) {
    clientKey = apiKey;
    clientPromise = import(SDK_URL).then(({ default: Anthropic }) =>
      // Personal app: the key belongs to the user and never leaves their device except to api.anthropic.com.
      new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 }),
    );
  }
  return clientPromise;
}

const SYSTEM = `You are a nutrition estimator for a personal calorie-tracking app used in Thailand.
You get a photo of a meal and/or a text description and estimate energy and macronutrients for what the person ate.

How to estimate:
- Identify every distinct dish or component (rice, the main dish, fried egg, sauces, drinks, sides) as its own item.
- Assume typical Thai portions: street-food stalls, food courts, 7-Eleven, cafés and home cooking. Use visual cues (plate and bowl size, utensils, hands) to scale.
- Account for hidden energy: cooking oil in stir-fries and deep-frying, coconut milk, sugar in drinks and dressings, condensed milk, sauces.
- If the photo shows several plates (shared meal), estimate the whole visible amount unless the text says otherwise.
- The user's text (portion, how much they ate, ingredients) overrides what the photo suggests.
- kcal_low/kcal_high is a realistic range for the whole meal reflecting your uncertainty.
- name_th / dish_th are natural Thai names (e.g. "ข้าวกะเพราไก่ไข่ดาว"); name_en / dish_en are common English names or romanized Thai.
- note: one short sentence in {LANG} only when there's something worth flagging (assumption made, low confidence); otherwise an empty string.
- If the image clearly isn't food or drink, set is_food to false and leave items empty.`;

const SCHEMA = {
  type: "object",
  properties: {
    is_food: { type: "boolean" },
    dish_th: { type: "string" },
    dish_en: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name_th: { type: "string" },
          name_en: { type: "string" },
          kcal: { type: "number" },
          protein_g: { type: "number" },
          carb_g: { type: "number" },
          fat_g: { type: "number" },
        },
        required: ["name_th", "name_en", "kcal", "protein_g", "carb_g", "fat_g"],
        additionalProperties: false,
      },
    },
    kcal_low: { type: "number" },
    kcal_high: { type: "number" },
    note: { type: "string" },
  },
  required: ["is_food", "dish_th", "dish_en", "items", "kcal_low", "kcal_high", "note"],
  additionalProperties: false,
};

/**
 * @param {{apiKey:string, imageB64?:string|null, text?:string, correction?:string|null, previous?:object|null, lang:"th"|"en"}} opts
 */
export async function analyzeMeal({ apiKey, imageB64 = null, text = "", correction = null, previous = null, lang = "th" }) {
  const client = await getClient(apiKey);

  const content = [];
  if (imageB64) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageB64 } });
  let prompt = imageB64 ? "Estimate the nutrition of this meal." : "Estimate the nutrition of this meal from the description.";
  if (text) prompt += `\n\nUser's description / notes:\n${text}`;
  if (correction && previous) {
    prompt += `\n\nYour previous estimate was:\n${JSON.stringify(previous)}\n\nThe user says this needs fixing:\n${correction}\n\nReturn a corrected full estimate.`;
  }
  content.push({ type: "text", text: prompt });

  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM.replace("{LANG}", lang === "en" ? "English" : "Thai"),
      messages: [{ role: "user", content }],
    });
  } catch (e) {
    throw new Error(friendlyError(e, lang));
  }

  if (res.stop_reason === "refusal") throw new Error(lang === "en" ? "The request was declined. Try another photo." : "คำขอถูกปฏิเสธ ลองรูปอื่นดูนะ");
  if (res.stop_reason === "max_tokens") throw new Error(lang === "en" ? "Response was cut off. Please try again." : "คำตอบถูกตัด ลองใหม่อีกครั้ง");
  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("empty response");
  const data = JSON.parse(textBlock.text);
  data.items = Array.isArray(data.items) ? data.items : [];
  if (data.is_food && !data.items.length) data.is_food = false;
  return data;
}

function friendlyError(e, lang) {
  const s = e?.status;
  const th = lang !== "en";
  if (s === 401) return th ? "API key ไม่ถูกต้อง" : "Invalid API key";
  if (s === 402 || /credit/i.test(e?.message || "")) return th ? "เครดิต API หมด" : "Out of API credits";
  if (s === 429) return th ? "เรียกถี่เกินไป รอสักครู่แล้วลองใหม่" : "Rate limited, try again shortly";
  if (s >= 500) return th ? "เซิร์ฟเวอร์ Claude มีปัญหา ลองใหม่อีกครั้ง" : "Claude server error, try again";
  if (!s) return th ? "เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ต" : "Network error, check your connection";
  return e?.message || String(e);
}
