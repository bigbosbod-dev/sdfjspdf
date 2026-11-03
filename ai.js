// Meal analysis from a photo / nutrition label / text.
// Providers: Google Gemini (has a free tier) or Claude (paid API).

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
- If the image clearly isn't food, drink or a nutrition label, set is_food to false and leave items empty.`;

const LABEL_PROMPT = `This photo is a nutrition facts label (Thai "ข้อมูลโภชนาการ" / "ฉลากโภชนาการ" or similar).
Read the values for ONE serving (หนึ่งหน่วยบริโภค) exactly as printed. Return a single item.
If only per-100 g values are printed, use those and say so in note. Put the product name in dish_th/dish_en if visible, otherwise a short description.
kcal_low and kcal_high should both equal the printed energy (kcal). Convert kJ to kcal if needed (÷ 4.184).`;

const JSON_SHAPE = `Respond with JSON only, exactly this shape:
{"is_food": boolean, "dish_th": string, "dish_en": string,
 "items": [{"name_th": string, "name_en": string, "kcal": number, "protein_g": number, "carb_g": number, "fat_g": number}],
 "kcal_low": number, "kcal_high": number, "note": string}`;

function buildPrompt({ hasImage, mode, text, correction, previous }) {
  let p = mode === "label" ? LABEL_PROMPT : hasImage ? "Estimate the nutrition of this meal." : "Estimate the nutrition of this meal from the description.";
  if (text) p += `\n\nUser's description / notes:\n${text}`;
  if (correction && previous) p += `\n\nYour previous estimate was:\n${JSON.stringify(previous)}\n\nThe user says this needs fixing:\n${correction}\n\nReturn a corrected full estimate.`;
  return p;
}

function normalize(data) {
  data.items = Array.isArray(data.items) ? data.items : [];
  data.items = data.items.map((i) => ({
    name_th: String(i.name_th ?? ""), name_en: String(i.name_en ?? ""),
    kcal: Number(i.kcal) || 0, protein_g: Number(i.protein_g) || 0, carb_g: Number(i.carb_g) || 0, fat_g: Number(i.fat_g) || 0,
  }));
  const total = data.items.reduce((s, i) => s + i.kcal, 0);
  data.kcal_low = Number(data.kcal_low) || total;
  data.kcal_high = Number(data.kcal_high) || total;
  data.dish_th = data.dish_th || data.items[0]?.name_th || "";
  data.dish_en = data.dish_en || data.items[0]?.name_en || "";
  data.note = data.note || "";
  data.is_food = data.is_food !== false && data.items.length > 0;
  return data;
}

function parseJson(text) {
  const s = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try { return JSON.parse(s); } catch {}
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) return JSON.parse(s.slice(a, b + 1));
  throw new Error("bad JSON from model");
}

export async function analyzeMeal(opts) {
  return normalize(opts.provider === "claude" ? await claude(opts) : await gemini(opts));
}

/* ============================== Gemini (free tier) ============================== */
const G_BASE = "https://generativelanguage.googleapis.com/v1beta";
const G_CACHE = "kd_gemini_model";

// Find Flash models this key can use: the "latest" alias first, then newest stable, then previews, Lite last.
async function geminiCandidates(key) {
  const fallback = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"];
  let names = [];
  try {
    const r = await fetch(`${G_BASE}/models?pageSize=1000&key=${encodeURIComponent(key)}`);
    if (r.status === 400 || r.status === 401 || r.status === 403) {
      const j = await r.json().catch(() => ({}));
      throw Object.assign(new Error(j.error?.message || "invalid key"), { status: r.status });
    }
    const j = await r.json();
    names = (j.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => m.name.replace(/^models\//, ""))
      .filter((n) => /^gemini-.*flash/.test(n) && !/(image|tts|audio|live|thinking-exp|embedding|native)/.test(n));
  } catch (e) {
    if (e.status) throw e;
  }
  const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || "0");
  const score = (n) =>
    (/latest/.test(n) ? 1000 : 0) + ver(n) * 10 - (/lite/.test(n) ? 500 : 0) - (/preview|exp/.test(n) ? 3 : 0);
  const list = (names.length ? names : fallback).sort((a, b) => score(b) - score(a));
  let cached = null; try { cached = localStorage.getItem(G_CACHE); } catch {}
  if (cached && list.includes(cached)) list.unshift(list.splice(list.indexOf(cached), 1)[0]);
  return list.slice(0, 6);
}

async function gemini({ apiKey, imageB64, text, correction, previous, lang, mode }) {
  const parts = [];
  if (imageB64) parts.push({ inline_data: { mime_type: "image/jpeg", data: imageB64 } });
  parts.push({ text: buildPrompt({ hasImage: !!imageB64, mode, text, correction, previous }) + "\n\n" + JSON_SHAPE });
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM.replace("{LANG}", lang === "en" ? "English" : "Thai") }] },
    contents: [{ role: "user", parts }],
    generationConfig: { responseMimeType: "application/json" },
  });

  let lastErr;
  for (const model of await geminiCandidates(apiKey)) {
    let r;
    try {
      r = await fetch(`${G_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body,
      });
    } catch (e) { throw new Error(msg("network", lang)); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      lastErr = Object.assign(new Error(j.error?.message || `HTTP ${r.status}`), { status: r.status });
      if (r.status === 400 && /api key/i.test(j.error?.message || "")) throw new Error(msg("key", lang));
      if (r.status === 401 || r.status === 403) throw new Error(msg("key", lang));
      if ([404, 429, 500, 503].includes(r.status)) continue; // try the next model (quota is per model)
      throw new Error(j.error?.message || `HTTP ${r.status}`);
    }
    if (j.promptFeedback?.blockReason) throw new Error(msg("refused", lang));
    const txt = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    if (!txt) { lastErr = new Error("empty response"); continue; }
    try { localStorage.setItem(G_CACHE, model); } catch {}
    return parseJson(txt);
  }
  if (lastErr?.status === 429) throw new Error(msg("quota", lang));
  if (lastErr?.status >= 500) throw new Error(msg("server", lang));
  throw lastErr || new Error("no model available");
}

/* ============================== Claude (paid) ============================== */
const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk@1.0.0/+esm";
const MODEL = "claude-opus-5-5";
const SCHEMA = {
  type: "object",
  properties: {
    is_food: { type: "boolean" }, dish_th: { type: "string" }, dish_en: { type: "string" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name_th: { type: "string" }, name_en: { type: "string" }, kcal: { type: "number" },
          protein_g: { type: "number" }, carb_g: { type: "number" }, fat_g: { type: "number" },
        },
        required: ["name_th", "name_en", "kcal", "protein_g", "carb_g", "fat_g"],
        additionalProperties: false,
      },
    },
    kcal_low: { type: "number" }, kcal_high: { type: "number" }, note: { type: "string" },
  },
  required: ["is_food", "dish_th", "dish_en", "items", "kcal_low", "kcal_high", "note"],
  additionalProperties: false,
};

let clientPromise = null, clientKey = null;
function getClient(apiKey) {
  if (!clientPromise || clientKey !== apiKey) {
    clientKey = apiKey;
    clientPromise = import(SDK_URL).then(({ default: Anthropic }) =>
      new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 }));
  }
  return clientPromise;
}

async function claude({ apiKey, imageB64, text, correction, previous, lang, mode }) {
  const client = await getClient(apiKey);
  const content = [];
  if (imageB64) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageB64 } });
  content.push({ type: "text", text: buildPrompt({ hasImage: !!imageB64, mode, text, correction, previous }) });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL, max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      system: SYSTEM.replace("{LANG}", lang === "en" ? "English" : "Thai"),
      messages: [{ role: "user", content }],
    });
  } catch (e) {
    const s = e?.status;
    if (s === 401) throw new Error(msg("key", lang));
    if (s === 429) throw new Error(msg("quota", lang));
    if (s >= 500) throw new Error(msg("server", lang));
    if (!s) throw new Error(msg("network", lang));
    throw new Error(e?.message || String(e));
  }
  if (res.stop_reason === "refusal") throw new Error(msg("refused", lang));
  if (res.stop_reason === "max_tokens") throw new Error(msg("cut", lang));
  const tb = res.content.find((b) => b.type === "text");
  if (!tb) throw new Error("empty response");
  return parseJson(tb.text);
}

/* ============================== messages ============================== */
const MSG = {
  key: ["API key ไม่ถูกต้อง ตรวจสอบในหน้า \"ฉัน\"", "Invalid API key. Check it in Profile."],
  quota: ["ใช้โควต้าฟรีครบแล้ว ลองใหม่ภายหลัง (หรือพรุ่งนี้) หรือค้นหาเมนูแทน", "Free quota used up. Try later, or search the food list instead."],
  server: ["เซิร์ฟเวอร์ AI มีปัญหา ลองใหม่อีกครั้ง", "AI server error, try again"],
  network: ["เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ต", "Network error, check your connection"],
  refused: ["AI ไม่ตอบคำขอนี้ ลองรูปอื่นดูนะ", "The request was declined. Try another photo."],
  cut: ["คำตอบถูกตัด ลองใหม่อีกครั้ง", "Response was cut off. Please try again."],
};
const msg = (k, lang) => MSG[k][lang === "en" ? 1 : 0];
