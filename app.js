// กินดี — personal calorie tracker (Thai/English), AI photo analysis via the Claude API.
// All data stays in this browser's localStorage. No server.

import { analyzeMeal } from "./ai.js";
import { FOODS, UNIT_EN } from "./foods.js";
import { startScanner, lookupProduct } from "./barcode.js";

/* ============================== i18n ============================== */
const STR = {
  th: {
    appName: "กินดี", tabHome: "หน้าหลัก", tabProgress: "ความคืบหน้า", tabProfile: "ฉัน",
    kcal: "แคล", kcalLeft: "แคลอรี่คงเหลือ", kcalOver: "แคลอรี่เกิน", g: "ก.", kg: "กก.",
    proteinLeft: "โปรตีนเหลือ", carbLeft: "คาร์บเหลือ", fatLeft: "ไขมันเหลือ",
    proteinOver: "โปรตีนเกิน", carbOver: "คาร์บเกิน", fatOver: "ไขมันเกิน",
    protein: "โปรตีน", carb: "คาร์บ", fat: "ไขมัน", energy: "พลังงาน",
    todayLog: "บันทึกวันนี้", dayLog: "บันทึก", items: "รายการ",
    breakfast: "เช้า", lunch: "กลางวัน", snack: "ของว่าง", dinner: "เย็น",
    mealBreakfast: "มื้อเช้า", mealLunch: "มื้อกลางวัน", mealSnack: "มื้อว่าง", mealDinner: "มื้อเย็น",
    emptyDay: "ยังไม่มีบันทึก กด + เพื่อถ่ายรูปอาหาร",
    addFood: "เพิ่มอาหาร", takePhoto: "ถ่ายรูป", fromGallery: "คลังภาพ", typeIt: "พิมพ์บอก",
    hintPh: "ใส่มาในอะไร? กินไปเท่าไหร่? บอกได้จะกะปริมาณแม่นขึ้น (ไม่บังคับ)",
    describePh: "เช่น ข้าวมันไก่ 1 จาน + ชาไทยเย็นหวานน้อย",
    analyze: "วิเคราะห์", analyzing: "กำลังวิเคราะห์อาหาร…", analyzingSub: "ใช้เวลาประมาณ 10–30 วินาที",
    maybe: "อาจอยู่ระหว่าง", alsoInMeal: "มีในมื้อนี้ด้วย",
    fixResult: "แก้ไขผลลัพธ์", save: "บันทึก", saved: "บันทึกแล้ว", del: "ลบรายการนี้", deleted: "ลบแล้ว",
    fixPh: "บอกสิ่งที่ผิด เช่น \"ไข่ดาว 2 ฟอง\" หรือ \"ไม่ได้กินข้าวหมด กินครึ่งเดียว\"",
    reanalyze: "คำนวณใหม่", cancel: "ยกเลิก", notFood: "ดูเหมือนรูปนี้ไม่ใช่อาหาร ลองถ่ายใหม่หรือพิมพ์บอกแทน",
    needKey: "ใส่ Claude API key ในหน้า \"ฉัน\" ก่อนนะ", servings: "จำนวน",
    progressTitle: "ความคืบหน้า", streak: "วันต่อเนื่อง", daysLogged: "วันที่บันทึก",
    currentWeight: "น้ำหนักปัจจุบัน", logWeight: "บันทึกน้ำหนัก", start: "เริ่มต้น", goal: "เป้าหมาย",
    eta: "ถึงเป้าประมาณ", reached: "ถึงเป้าหมายแล้ว 🎉", weightTrend: "แนวโน้มน้ำหนัก", ofGoal: "ของเป้าหมาย",
    noWeight: "ยังไม่มีข้อมูลน้ำหนัก", last7: "แคลอรี่ 7 วันล่าสุด", avg: "เฉลี่ย",
    profile: "ฉัน", body: "ข้อมูลร่างกาย", sex: "เพศ", male: "ชาย", female: "หญิง", age: "อายุ",
    height: "ส่วนสูง (ซม.)", weight: "น้ำหนัก (กก.)", goalWeight: "น้ำหนักเป้าหมาย (กก.)",
    activity: "กิจกรรม", act1: "นั่งทำงาน แทบไม่ออกกำลัง", act2: "ออกกำลัง 1–3 วัน/สัปดาห์", act3: "ออกกำลัง 3–5 วัน/สัปดาห์", act4: "ออกกำลังหนัก 6–7 วัน/สัปดาห์",
    pace: "ความเร็ว (กก./สัปดาห์)", dailyGoals: "เป้าหมายต่อวัน", recalc: "คำนวณจากข้อมูลร่างกาย",
    tdee: "TDEE (เผาผลาญต่อวัน)", language: "ภาษา", apiKey: "Claude API key", apiKeyHelp: "เก็บไว้ในเครื่องนี้เท่านั้น ใช้เรียก Claude เพื่อวิเคราะห์รูปอาหาร",
    data: "ข้อมูล", exportData: "สำรองข้อมูล (ไฟล์ JSON)", importData: "นำเข้าข้อมูลสำรอง", clearData: "ลบข้อมูลทั้งหมด",
    confirmClear: "ลบข้อมูลทั้งหมดในเครื่องนี้? กู้คืนไม่ได้", imported: "นำเข้าข้อมูลแล้ว", importFail: "ไฟล์ไม่ถูกต้อง",
    storageFull: "พื้นที่เก็บข้อมูลเต็ม ลองสำรองแล้วลบข้อมูลเก่า", settingsSaved: "บันทึกการตั้งค่าแล้ว",
    date: "วันที่", time: "เวลา", weightSaved: "บันทึกน้ำหนักแล้ว", errorPrefix: "เกิดข้อผิดพลาด: ",
    lose: "ลด", gain: "เพิ่ม", maintain: "คงที่",
    searchPh: "ค้นหาเมนู เช่น กะเพรา, ชาไทย, ส้มตำ", recent: "ล่าสุด", results: "ผลการค้นหา", noResults: "ไม่พบเมนูนี้ ลองสร้างเองหรือใช้ AI",
    scanBarcode: "บาร์โค้ด", snapLabel: "ฉลาก", askAi: "พิมพ์ให้ AI", createOwn: "สร้างเอง", aiTools: "ให้ AI คำนวณ (ฟรีด้วย Gemini)",
    scanTitle: "สแกนบาร์โค้ด", scanHelp: "เล็งกล้องไปที่บาร์โค้ด", enterCode: "หรือพิมพ์เลขบาร์โค้ด", lookup: "ค้นหา",
    looking: "กำลังค้นหาสินค้า…", notFound: "ไม่พบสินค้านี้ในฐานข้อมูล ลองถ่ายฉลากให้ AI อ่านแทน", noNutrition: "สินค้านี้ยังไม่มีข้อมูลโภชนาการ ลองถ่ายฉลากแทน",
    camError: "เปิดกล้องไม่ได้ พิมพ์เลขบาร์โค้ดแทนได้", perServing: "ค่าต่อ", fromOff: "ข้อมูลจาก Open Food Facts",
    newFood: "เมนูใหม่", needName: "ใส่ชื่ออาหารก่อน", aiProvider: "AI สำหรับวิเคราะห์รูป",
    gemini: "Gemini (ฟรี)", claude: "Claude (เสียเงิน)", geminiKey: "Gemini API key",
    geminiHelp: "สมัครฟรีที่ aistudio.google.com/apikey (ไม่ต้องใส่บัตร) มีโควต้าใช้ฟรีต่อวัน ข้อมูลจากการใช้แบบฟรี Google อาจนำไปปรับปรุงบริการ",
    needAiKey: "ใส่ API key ในหน้า \"ฉัน\" ก่อนนะ (Gemini ฟรี) หรือใช้ค้นหาเมนูแทน", hintToggle: "+ ใส่คำอธิบายเพิ่มให้ AI",
  },
  en: {
    appName: "KinDee", tabHome: "Home", tabProgress: "Progress", tabProfile: "Profile",
    kcal: "kcal", kcalLeft: "Calories left", kcalOver: "Calories over", g: "g", kg: "kg",
    proteinLeft: "Protein left", carbLeft: "Carbs left", fatLeft: "Fat left",
    proteinOver: "Protein over", carbOver: "Carbs over", fatOver: "Fat over",
    protein: "Protein", carb: "Carbs", fat: "Fat", energy: "Energy",
    todayLog: "Today's log", dayLog: "Log", items: "entries",
    breakfast: "Morning", lunch: "Lunch", snack: "Snack", dinner: "Evening",
    mealBreakfast: "Breakfast", mealLunch: "Lunch", mealSnack: "Snack", mealDinner: "Dinner",
    emptyDay: "Nothing logged yet. Tap + to snap your meal.",
    addFood: "Add food", takePhoto: "Camera", fromGallery: "Photos", typeIt: "Describe",
    hintPh: "What's it served in? How much did you eat? Helps portion accuracy (optional)",
    describePh: "e.g. chicken rice 1 plate + Thai iced tea, less sugar",
    analyze: "Analyze", analyzing: "Analyzing your meal…", analyzingSub: "Takes about 10–30 seconds",
    maybe: "Could be", alsoInMeal: "Also in this meal",
    fixResult: "Fix result", save: "Save", saved: "Saved", del: "Delete entry", deleted: "Deleted",
    fixPh: "Tell what's wrong, e.g. \"2 fried eggs\" or \"I only ate half the rice\"",
    reanalyze: "Recalculate", cancel: "Cancel", notFood: "This doesn't look like food. Try another photo or describe it.",
    needKey: "Add your Claude API key in Profile first", servings: "Servings",
    progressTitle: "Progress", streak: "Day streak", daysLogged: "Days logged",
    currentWeight: "Current weight", logWeight: "Log weight", start: "Start", goal: "Goal",
    eta: "Estimated goal date", reached: "Goal reached 🎉", weightTrend: "Weight trend", ofGoal: "of goal",
    noWeight: "No weight data yet", last7: "Calories, last 7 days", avg: "avg",
    profile: "Profile", body: "Body", sex: "Sex", male: "Male", female: "Female", age: "Age",
    height: "Height (cm)", weight: "Weight (kg)", goalWeight: "Goal weight (kg)",
    activity: "Activity", act1: "Sedentary", act2: "Light, 1–3 days/week", act3: "Moderate, 3–5 days/week", act4: "Hard, 6–7 days/week",
    pace: "Pace (kg/week)", dailyGoals: "Daily goals", recalc: "Calculate from body data",
    tdee: "TDEE (daily burn)", language: "Language", apiKey: "Claude API key", apiKeyHelp: "Stored on this device only. Used to call Claude for photo analysis.",
    data: "Data", exportData: "Back up data (JSON file)", importData: "Import backup", clearData: "Delete all data",
    confirmClear: "Delete all data on this device? This can't be undone.", imported: "Backup imported", importFail: "Invalid file",
    storageFull: "Storage is full. Back up and delete old data.", settingsSaved: "Settings saved",
    date: "Date", time: "Time", weightSaved: "Weight saved", errorPrefix: "Error: ",
    lose: "lose", gain: "gain", maintain: "maintain",
    searchPh: "Search food, e.g. basil, thai tea, papaya salad", recent: "Recent", results: "Results", noResults: "Not found. Create it or use AI.",
    scanBarcode: "Barcode", snapLabel: "Label", askAi: "Describe to AI", createOwn: "Create", aiTools: "Let AI calculate (free with Gemini)",
    scanTitle: "Scan barcode", scanHelp: "Point the camera at a barcode", enterCode: "Or type the barcode number", lookup: "Look up",
    looking: "Looking up product…", notFound: "Product not found. Try snapping the nutrition label instead.", noNutrition: "No nutrition data for this product. Try snapping the label.",
    camError: "Can't open the camera. Type the number instead.", perServing: "Per", fromOff: "Data from Open Food Facts",
    newFood: "New food", needName: "Enter a food name first", aiProvider: "AI for photo analysis",
    gemini: "Gemini (free)", claude: "Claude (paid)", geminiKey: "Gemini API key",
    geminiHelp: "Get one free at aistudio.google.com/apikey (no card needed). Free daily quota; Google may use free-tier data to improve its products.",
    needAiKey: "Add an API key in Profile first (Gemini is free), or search the food list", hintToggle: "+ Add notes for the AI",
  },
};
const t = (k) => (STR[settings.lang] || STR.th)[k] ?? STR.th[k] ?? k;

/* ============================== storage ============================== */
const store = {
  get(k, d) { try { const v = localStorage.getItem("kd_" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) {
    try { localStorage.setItem("kd_" + k, JSON.stringify(v)); return true; }
    catch { toast(t("storageFull")); return false; }
  },
};

function defaultSettings() {
  return {
    lang: "th", apiKey: "", provider: "gemini", geminiKey: "",
    body: { sex: "male", age: 30, height: 170, weight: 70, goalWeight: 65, activity: 1.375, pace: 0.5 },
    goals: null, // filled from body on first run
  };
}

let settings = store.get("settings", null) || defaultSettings();
if (!settings.goals) settings.goals = computeGoals(settings.body);
if (!settings.provider) settings.provider = "gemini";
if (settings.geminiKey === undefined) settings.geminiKey = "";
const aiKey = () => (settings.provider === "claude" ? settings.apiKey : settings.geminiKey);
let entries = store.get("entries", []);
let weights = store.get("weights", []);
const state = { tab: "home", date: ymd(new Date()) };

const saveSettings = () => store.set("settings", settings);
const saveEntries = () => store.set("entries", entries);
const saveWeights = () => store.set("weights", weights);

/* ============================== helpers ============================== */
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Math.round(Number(n) || 0).toLocaleString("en-US");
const fmt1 = (n) => (Math.round((Number(n) || 0) * 10) / 10).toLocaleString("en-US");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function ymd(d) {
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}
function parseYmd(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(s, n) { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); }
function hhmm(d = new Date()) { return d.toTimeString().slice(0, 5); }

const TH_DOW = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const EN_DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
const EN_MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dow = (d) => (settings.lang === "en" ? EN_DOW : TH_DOW)[d.getDay()];
function shortDate(s) {
  const d = parseYmd(s);
  return settings.lang === "en" ? `${EN_MON[d.getMonth()]} ${d.getDate()}` : `${d.getDate()} ${TH_MON[d.getMonth()]}`;
}
function longDate(d) {
  return settings.lang === "en"
    ? `${EN_MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    : `${d.getDate()} ${TH_MON[d.getMonth()]} ${d.getFullYear() + 543}`;
}

const MEALS = ["breakfast", "lunch", "snack", "dinner"];
const mealLabel = (m) => t("meal" + m[0].toUpperCase() + m.slice(1));
function mealForTime(time) {
  const [h, m] = time.split(":").map(Number); const x = h + m / 60;
  if (x < 10.5) return "breakfast";
  if (x < 14.5) return "lunch";
  if (x < 17) return "snack";
  return "dinner";
}

let toastTimer;
function toast(msg) {
  const el = $("#toast"); el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}

/* ============================== nutrition math ============================== */
function computeGoals(b) {
  const bmr = 10 * b.weight + 6.25 * b.height - 5 * b.age + (b.sex === "male" ? 5 : -161); // Mifflin–St Jeor
  const tdee = bmr * b.activity;
  const dir = b.goalWeight < b.weight ? -1 : b.goalWeight > b.weight ? 1 : 0;
  const delta = dir * b.pace * 7700 / 7; // 1 kg ≈ 7,700 kcal
  const floor = b.sex === "male" ? 1500 : 1200;
  const kcal = Math.max(floor, Math.round((tdee + delta) / 10) * 10);
  const protein = Math.round(1.6 * Math.min(b.weight, Math.max(b.goalWeight, b.weight * 0.85)));
  const fat = Math.round((kcal * 0.27) / 9);
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carb, fat, tdee: Math.round(tdee) };
}

const totalsOf = (e) => ({
  kcal: e.kcal * e.servings, protein: e.protein * e.servings, carb: e.carb * e.servings, fat: e.fat * e.servings,
});
function dayTotals(date) {
  const s = { kcal: 0, protein: 0, carb: 0, fat: 0 };
  for (const e of entries) if (e.date === date) {
    const x = totalsOf(e); s.kcal += x.kcal; s.protein += x.protein; s.carb += x.carb; s.fat += x.fat;
  }
  return s;
}
function streak() {
  const days = new Set(entries.map((e) => e.date));
  let d = ymd(new Date());
  if (!days.has(d)) d = addDays(d, -1); // today not logged yet doesn't break the streak
  let n = 0;
  while (days.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/* ============================== icons ============================== */
const IC = {
  flame: (c = "currentColor", s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M12 2s5 4.6 5 10.2a5 5 0 0 1-10 0c0-2.2 1-3.9 2-5 .2 1.6 1 2.7 2 3.2C11 7.7 12 2 12 2Zm0 18a2.6 2.6 0 0 0 2.6-2.6c0-1.8-2.6-4-2.6-4s-2.6 2.2-2.6 4A2.6 2.6 0 0 0 12 20Z"/></svg>`,
  fish: (c = "currentColor", s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M2 12s3.5-5 9-5c4 0 7 2.5 8.5 5C18 14.5 15 17 11 17c-5.5 0-9-5-9-5Zm17.5 0L23 8.5v7L19.5 12ZM14.5 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/></svg>`,
  fork: (c = "currentColor", s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M16.5 3c-1.7 1.3-2.5 3.5-2.5 6.5V13h3v8"/></svg>`,
  drop: (c = "currentColor", s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${c}"><path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/></svg>`,
  meal: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M16.5 3c-1.7 1.3-2.5 3.5-2.5 6.5V13h3v8"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  camera: `<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-9 9"/></svg>`,
  text: `<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg>`,
  label: `<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>`,
  barcode: `<svg viewBox="0 0 24 24"><path d="M4 6v12M7 6v12M10 6v12M14 6v12M16 6v12M20 6v12"/></svg>`,
  pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  logo: `<svg viewBox="0 0 64 64"><circle cx="32" cy="34" r="22" fill="#2a2a2c"/><path d="M32 12c4-6 10-7 14-5-2 5-7 8-14 5Z" fill="#2f9e5b"/><circle cx="32" cy="34" r="12" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="56 80" stroke-linecap="round" transform="rotate(-90 32 34)"/></svg>`,
};

function ring(size, stroke, pct, color, inner = "", track = "#eeeeee", overColor = null) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct));
  const over = pct > 1 && overColor;
  const overLen = over ? Math.min(1, pct - 1) * c : 0;
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${p * c} ${c}"/>
      ${over ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${overColor}" stroke-width="${stroke}" stroke-dasharray="${overLen} ${c}"/>` : ""}
    </svg><div class="ico">${inner}</div></div>`;
}

/* ============================== views ============================== */
function render() {
  document.documentElement.lang = settings.lang;
  document.title = t("appName");
  document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === state.tab));
  const v = $("#view");
  v.innerHTML = state.tab === "home" ? viewHome() : state.tab === "progress" ? viewProgress() : viewProfile();
  window.scrollTo(0, 0);
}

function viewHome() {
  const today = ymd(new Date());
  const g = settings.goals;
  const tot = dayTotals(state.date);
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i), dt = dayTotals(d), logged = entries.some((e) => e.date === d);
    days.push(`<button class="day ${d === state.date ? "sel" : ""} ${logged ? "logged" : ""} ${dt.kcal > g.kcal ? "over" : ""}" data-date="${d}">
      ${dow(parseYmd(d))}<b class="num">${parseYmd(d).getDate()}</b></button>`);
  }
  const left = g.kcal - tot.kcal;
  const macro = (key, color, icon) => {
    const rem = g[key] - tot[key], over = rem < 0;
    return `<div class="card macro ${over ? "over" : ""}">
      <div><div class="v num">${fmt(Math.abs(rem))}${t("g")}</div><div class="l">${t(key + (over ? "Over" : "Left"))}</div></div>
      ${ring(68, 6, g[key] ? tot[key] / g[key] : 0, color, icon(color), "#eeeeee", "#c62828")}
    </div>`;
  };
  const list = entries.filter((e) => e.date === state.date).sort((a, b) => a.time.localeCompare(b.time));
  const groups = MEALS.map((m) => [m, list.filter((e) => e.meal === m)]).filter(([, l]) => l.length).reverse();

  return `
  <div class="top">
    <div class="brand">${IC.logo}<span>${t("appName")}</span></div>
    <div class="streak-pill">${IC.flame("#f57c00", 16)}<span class="num">${streak()}</span></div>
  </div>
  <div class="days">${days.join("")}</div>
  <div class="stack">
    <div class="card hero">
      <div><div class="big num ${left < 0 ? "over" : ""}">${fmt(Math.abs(left))}</div><div class="lbl">${left < 0 ? t("kcalOver") : t("kcalLeft")}</div>
        <div class="lbl num">${fmt(tot.kcal)} / ${fmt(g.kcal)} ${t("kcal")}</div></div>
      ${ring(120, 11, g.kcal ? tot.kcal / g.kcal : 0, "#2a2a2c", IC.flame("#2a2a2c", 26), "#eeeeee", "#c62828")}
    </div>
    <div class="macros">
      ${macro("protein", "#e5484d", (c) => IC.fish(c))}
      ${macro("carb", "#2f9e5b", (c) => IC.fork(c))}
      ${macro("fat", "#1e88e5", (c) => IC.drop(c))}
    </div>
  </div>
  <div class="sec-head"><h2>${state.date === today ? t("todayLog") : `${t("dayLog")} ${shortDate(state.date)}`}</h2><span>${list.length} ${t("items")}</span></div>
  ${groups.length ? `<div class="stack">${groups.map(([m, l]) => `
    <div class="card meal-group">
      <div class="meal-head"><b>${t(m)}</b><span class="num">${fmt(l.reduce((s, e) => s + e.kcal * e.servings, 0))} ${t("kcal")}</span></div>
      ${l.map(entryRow).join("")}
    </div>`).join("")}</div>`
    : `<div class="card empty">${IC.camera.replace("<svg", '<svg fill="none" stroke-width="1.6"')}<div>${t("emptyDay")}</div></div>`}
  `;
}

function entryRow(e) {
  const x = totalsOf(e);
  const name = settings.lang === "en" ? (e.nameEn || e.name) : e.name;
  const sub = settings.lang === "en" ? (e.nameEn ? e.name : "") : e.nameEn;
  return `<button class="entry" data-entry="${e.id}">
    ${e.photo ? `<img class="thumb" src="${e.photo}" alt="">` : `<div class="thumb">${IC.meal}</div>`}
    <div class="info">
      <div class="name">${esc(name)}${e.servings !== 1 ? ` ×${e.servings}` : ""}</div>
      ${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
      <div class="mac num">${IC.flame("#2a2a2c", 13)}<b>${fmt(x.kcal)} ${t("kcal")}</b>
        <span><i style="background:var(--protein)"></i>${fmt(x.protein)}${t("g")}</span>
        <span><i style="background:var(--carb)"></i>${fmt(x.carb)}${t("g")}</span>
        <span><i style="background:var(--fat)"></i>${fmt(x.fat)}${t("g")}</span></div>
    </div>
    <span class="time num">${e.time}</span>
  </button>`;
}

function viewProgress() {
  const b = settings.body;
  const sorted = [...weights].sort((a, b2) => a.date.localeCompare(b2.date));
  const startW = sorted[0]?.kg ?? b.weight;
  const curW = sorted.at(-1)?.kg ?? b.weight;
  const goalW = b.goalWeight;
  const span = startW - goalW;
  const pct = span === 0 ? 1 : Math.max(0, Math.min(1, (startW - curW) / span));
  const remaining = Math.abs(curW - goalW);
  const reached = span >= 0 ? curW <= goalW : curW >= goalW;
  let etaTxt = "";
  if (reached && sorted.length) etaTxt = t("reached");
  else if (b.pace > 0 && remaining > 0) {
    const d = new Date(); d.setDate(d.getDate() + Math.ceil((remaining / b.pace) * 7));
    etaTxt = `${t("eta")} ${longDate(d)}`;
  }
  const loggedDays = new Set(entries.map((e) => e.date)).size;

  // last 7 days bars
  const today = ymd(new Date());
  const bars = []; let sum = 0, n = 0;
  for (let i = 6; i >= 0; i--) { const d = addDays(today, -i); const k = dayTotals(d).kcal; bars.push([d, k]); if (k) { sum += k; n++; } }

  return `
  <div class="h1">${t("progressTitle")}</div>
  <div class="stack">
    <div class="two">
      <div class="card stat"><div class="flame-big">${IC.flame("#f57c00", 64)}</div><div class="big num">${streak()}</div><div class="lbl">${t("streak")}</div></div>
      <div class="card stat"><div class="flame-big" style="display:grid;place-items:center">${ring(60, 7, Math.min(1, loggedDays / 30), "#2a2a2c")}</div><div class="big num">${loggedDays}</div><div class="lbl">${t("daysLogged")}</div></div>
    </div>
    <div class="card weight-card">
      <div class="row"><div><div class="small muted">${t("currentWeight")}</div><div class="big num">${fmt1(curW)} ${t("kg")}</div></div>
        <button class="btn btn-dark btn-sm" id="btn-weight">${t("logWeight")} ${IC.arrow}</button></div>
      <div class="bar"><div style="width:${pct * 100}%"></div></div>
      <div class="meta num"><span>${t("start")} ${fmt1(startW)} ${t("kg")}</span><span>${t("goal")} ${fmt1(goalW)} ${t("kg")}</span></div>
      ${etaTxt ? `<div class="eta">${etaTxt}</div>` : ""}
    </div>
    <div class="card">
      <div class="row" style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">${t("weightTrend")}</h3>
        <span class="chip num">${Math.round(pct * 100)}% ${t("ofGoal")}</span></div>
      ${sorted.length >= 2 ? weightChart(sorted, goalW) : `<div class="empty" style="padding:24px 0 10px">${t("noWeight")}</div>`}
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">${t("last7")}</h3>
        <span class="chip num">${t("avg")} ${fmt(n ? sum / n : 0)} ${t("kcal")}</span></div>
      ${kcalBars(bars)}
    </div>
  </div>`;
}

function weightChart(pts, goal) {
  const W = 340, H = 200, L = 34, R = 10, T = 12, B = 26;
  const data = pts.slice(-60);
  const vals = data.map((p) => p.kg).concat(goal);
  let lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5);
  if (hi - lo < 3) hi = lo + 3;
  const t0 = parseYmd(data[0].date).getTime(), t1 = parseYmd(data.at(-1).date).getTime() || t0 + 1;
  const x = (d) => L + ((parseYmd(d).getTime() - t0) / Math.max(1, t1 - t0)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const step = Math.max(1, Math.round((hi - lo) / 4));
  let grid = "";
  for (let v = lo; v <= hi; v += step) grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#eee" stroke-dasharray="3 4"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  const goalLine = goal >= lo && goal <= hi ? `<line x1="${L}" x2="${W - R}" y1="${y(goal)}" y2="${y(goal)}" stroke="#2f9e5b" stroke-dasharray="5 4"/>` : "";
  const path = data.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.kg).toFixed(1)}`).join("");
  const dots = data.map((p) => `<circle cx="${x(p.date)}" cy="${y(p.kg)}" r="3" fill="#2a2a2c"/>`).join("");
  const idx = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  const labels = idx.map((i, j) => `<text x="${x(data[i].date)}" y="${H - 6}" text-anchor="${j === 0 ? "start" : j === idx.length - 1 && idx.length > 1 ? "end" : "middle"}">${shortDate(data[i].date)}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${grid}${goalLine}<path d="${path}" fill="none" stroke="#2a2a2c" stroke-width="2" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}

function kcalBars(bars) {
  const W = 340, H = 170, T = 14, B = 26, goal = settings.goals.kcal;
  const max = Math.max(goal * 1.2, ...bars.map((b) => b[1]));
  const bw = (W - 20) / 7;
  const y = (v) => T + (1 - v / max) * (H - T - B);
  let s = `<line x1="6" x2="${W - 6}" y1="${y(goal)}" y2="${y(goal)}" stroke="#bbb" stroke-dasharray="4 4"/>`;
  bars.forEach(([d, k], i) => {
    const x = 10 + i * bw + bw * 0.2, w = bw * 0.6, h = Math.max(k ? 3 : 0, H - B - y(k));
    s += `<rect x="${x}" y="${H - B - h}" width="${w}" height="${h}" rx="6" fill="${k > goal ? "#c62828" : "#2a2a2c"}"/>`;
    s += `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle">${dow(parseYmd(d))}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${s}</svg>`;
}

function viewProfile() {
  const b = settings.body, g = settings.goals;
  const opt = (v, label, cur) => `<option value="${v}" ${String(v) === String(cur) ? "selected" : ""}>${label}</option>`;
  return `
  <div class="h1">${t("profile")}</div>
  <form class="stack" id="profile-form" autocomplete="off">
    <div class="card">
      <h3>${t("language")}</h3>
      <div class="seg" id="lang-seg"><button type="button" data-lang="th" class="${settings.lang === "th" ? "on" : ""}">ภาษาไทย</button><button type="button" data-lang="en" class="${settings.lang === "en" ? "on" : ""}">English</button></div>
    </div>
    <div class="card">
      <h3>${t("aiProvider")}</h3>
      <div class="seg" id="prov-seg" style="margin-bottom:12px"><button type="button" data-prov="gemini" class="${settings.provider === "gemini" ? "on" : ""}">${t("gemini")}</button><button type="button" data-prov="claude" class="${settings.provider === "claude" ? "on" : ""}">${t("claude")}</button></div>
      <div ${settings.provider === "gemini" ? "" : "hidden"}>
        <label class="field"><span>${t("geminiKey")}</span><input class="input" type="password" name="geminiKey" value="${esc(settings.geminiKey)}" placeholder="AIza..." autocomplete="off" spellcheck="false" /></label>
        <p class="small muted" style="margin:0 2px">${t("geminiHelp")} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a></p>
      </div>
      <div ${settings.provider === "claude" ? "" : "hidden"}>
        <label class="field"><span>${t("apiKey")}</span><input class="input" type="password" name="apiKey" value="${esc(settings.apiKey)}" placeholder="sk-ant-..." autocomplete="off" spellcheck="false" /></label>
        <p class="small muted" style="margin:0 2px">${t("apiKeyHelp")}</p>
      </div>
    </div>
    <div class="card">
      <h3>${t("body")}</h3>
      <div class="field"><span>${t("sex")}</span><div class="seg" id="sex-seg">
        <button type="button" data-sex="male" class="${b.sex === "male" ? "on" : ""}">${t("male")}</button>
        <button type="button" data-sex="female" class="${b.sex === "female" ? "on" : ""}">${t("female")}</button></div></div>
      <div class="grid2">
        <label class="field"><span>${t("age")}</span><input class="input" name="age" type="number" inputmode="numeric" value="${b.age}"></label>
        <label class="field"><span>${t("height")}</span><input class="input" name="height" type="number" inputmode="decimal" value="${b.height}"></label>
        <label class="field"><span>${t("weight")}</span><input class="input" name="weight" type="number" step="0.1" inputmode="decimal" value="${b.weight}"></label>
        <label class="field"><span>${t("goalWeight")}</span><input class="input" name="goalWeight" type="number" step="0.1" inputmode="decimal" value="${b.goalWeight}"></label>
      </div>
      <label class="field"><span>${t("activity")}</span><select class="input" name="activity">
        ${opt(1.2, t("act1"), b.activity)}${opt(1.375, t("act2"), b.activity)}${opt(1.55, t("act3"), b.activity)}${opt(1.725, t("act4"), b.activity)}</select></label>
      <label class="field"><span>${t("pace")}</span><select class="input" name="pace">
        ${[0.25, 0.5, 0.75, 1].map((p) => opt(p, p, b.pace)).join("")}</select></label>
      <button type="button" class="btn btn-light" id="btn-recalc" style="width:100%">${t("recalc")}</button>
      <p class="small muted num" style="margin:10px 2px 0">${t("tdee")}: ${fmt(g.tdee || computeGoals(b).tdee)} ${t("kcal")}</p>
    </div>
    <div class="card">
      <h3>${t("dailyGoals")}</h3>
      <div class="grid2">
        <label class="field"><span>${t("energy")} (${t("kcal")})</span><input class="input" name="g_kcal" type="number" inputmode="numeric" value="${g.kcal}"></label>
        <label class="field"><span>${t("protein")} (${t("g")})</span><input class="input" name="g_protein" type="number" inputmode="numeric" value="${g.protein}"></label>
        <label class="field"><span>${t("carb")} (${t("g")})</span><input class="input" name="g_carb" type="number" inputmode="numeric" value="${g.carb}"></label>
        <label class="field"><span>${t("fat")} (${t("g")})</span><input class="input" name="g_fat" type="number" inputmode="numeric" value="${g.fat}"></label>
      </div>
      <button class="btn btn-dark" style="width:100%" type="submit">${t("save")}</button>
    </div>
    <div class="card">
      <h3>${t("data")}</h3>
      <button type="button" class="setting-row" id="btn-export"><span>${t("exportData")}</span>${IC.arrow.replace("<svg", '<svg width="18" height="18"')}</button>
      <button type="button" class="setting-row" id="btn-import"><span>${t("importData")}</span>${IC.arrow.replace("<svg", '<svg width="18" height="18"')}</button>
      <button type="button" class="setting-row btn-danger" id="btn-clear"><span>${t("clearData")}</span></button>
    </div>
  </form>`;
}

function readProfileForm() {
  const f = $("#profile-form"); if (!f) return;
  const n = (k) => Number(f.elements[k].value);
  settings.apiKey = f.elements.apiKey.value.trim();
  settings.geminiKey = f.elements.geminiKey.value.trim();
  Object.assign(settings.body, {
    age: n("age") || settings.body.age, height: n("height") || settings.body.height,
    weight: n("weight") || settings.body.weight, goalWeight: n("goalWeight") || settings.body.goalWeight,
    activity: n("activity"), pace: n("pace"),
  });
  settings.goals = {
    kcal: n("g_kcal") || settings.goals.kcal, protein: n("g_protein") || 0, carb: n("g_carb") || 0, fat: n("g_fat") || 0,
    tdee: computeGoals(settings.body).tdee,
  };
}

/* ============================== sheets ============================== */
function openSheet(html, { full = false, onClose } = {}) {
  closeSheet();
  const root = $("#sheet-root");
  root.innerHTML = `<div class="backdrop"></div><div class="sheet ${full ? "full" : ""}">${full ? "" : '<div class="grab"></div>'}${html}</div>`;
  document.body.classList.add("sheet-open");
  root._onClose = onClose;
  $(".backdrop", root).addEventListener("click", closeSheet);
  return $(".sheet", root);
}
function closeSheet() {
  const root = $("#sheet-root");
  if (!root.innerHTML) return;
  root._onClose?.(); root._onClose = null;
  root.innerHTML = ""; document.body.classList.remove("sheet-open");
}

let pendingHint = "";
let pendingMode = "meal";
const norm = (x) => String(x || "").toLowerCase().replace(/\s+/g, "");

// Built-in list + everything you've logged before (latest version wins), as per-serving drafts.
function foodIndex() {
  const seen = new Map();
  const past = [...entries].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  for (const e of past) {
    const k = norm(e.name);
    if (!seen.has(k)) seen.set(k, { name: e.name, nameEn: e.nameEn, kcal: e.kcal, protein: e.protein, carb: e.carb, fat: e.fat, low: e.low, high: e.high, items: e.items, photo: e.photo, unit: "", past: true });
  }
  const list = [...seen.values()];
  for (const [name, nameEn, kcal, protein, carb, fat, unit] of FOODS) {
    if (!seen.has(norm(name))) list.push({ name, nameEn, kcal, protein, carb, fat, unit, past: false });
  }
  return list;
}

function searchFoods(q) {
  const idx = foodIndex();
  if (!q) return idx.filter((f) => f.past).slice(0, 12);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = [];
  for (const f of idx) {
    const hay = norm(f.name) + " " + (f.nameEn || "").toLowerCase();
    if (!words.every((w) => hay.includes(w))) continue;
    const starts = norm(f.name).startsWith(norm(q)) || (f.nameEn || "").toLowerCase().startsWith(q.toLowerCase());
    scored.push([(f.past ? 2 : 0) + (starts ? 1 : 0) - f.name.length / 100, f]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, 40).map((x) => x[1]);
}

function foodRow(f, i) {
  const name = settings.lang === "en" ? f.nameEn || f.name : f.name;
  const sub = [settings.lang === "en" ? (f.nameEn ? f.name : "") : f.nameEn, settings.lang === "en" ? UNIT_EN[f.unit] || f.unit : f.unit].filter(Boolean).join(" · ");
  return `<button class="entry" data-food="${i}">
    ${f.photo ? `<img class="thumb" src="${f.photo}" alt="">` : `<div class="thumb">${IC.meal}</div>`}
    <div class="info"><div class="name">${esc(name)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}
      <div class="mac num"><span><i style="background:var(--protein)"></i>${fmt(f.protein)}${t("g")}</span><span><i style="background:var(--carb)"></i>${fmt(f.carb)}${t("g")}</span><span><i style="background:var(--fat)"></i>${fmt(f.fat)}${t("g")}</span></div></div>
    <span class="time num"><b>${fmt(f.kcal)}</b> ${t("kcal")}</span></button>`;
}

function newDraft(extra = {}) {
  const time = hhmm();
  return { id: null, date: state.date, time, meal: mealForTime(time), servings: 1, photo: null, name: "", nameEn: "",
    kcal: 0, low: 0, high: 0, protein: 0, carb: 0, fat: 0, items: [], note: "", ai: null, ...extra };
}

function openAddSheet() {
  const s = openSheet(`
    <div class="sheet-head"><h2>${t("addFood")}</h2><button class="icon-btn" data-close>${IC.close}</button></div>
    <div class="ai-head small muted">${t("aiTools")}</div>
    <div class="pick pick5">
      <button data-src="camera">${IC.camera}${t("takePhoto")}</button>
      <button data-src="gallery">${IC.image}${t("fromGallery")}</button>
      <button data-src="label">${IC.label}${t("snapLabel")}</button>
      <button data-src="text">${IC.text}${t("askAi")}</button>
    </div>
    <button class="link small" id="hint-toggle">${t("hintToggle")}</button>
    <textarea class="input" id="hint" rows="2" placeholder="${esc(t("hintPh"))}" hidden></textarea>
    <div class="search-row">
      <input class="input" id="q" type="search" placeholder="${esc(t("searchPh"))}" autocomplete="off" />
      <button class="icon-btn big" data-src="barcode" aria-label="${esc(t("scanBarcode"))}">${IC.barcode}</button>
    </div>
    <div class="list-head small muted" id="list-head"></div>
    <div id="food-list"></div>
    <button class="btn btn-light" style="width:100%;margin-top:10px" id="create">${IC.pencil}${t("createOwn")}</button>`);
  let results = [];
  const q = $("#q", s);
  const draw = () => {
    results = searchFoods(q.value.trim());
    $("#list-head", s).textContent = q.value.trim() ? t("results") : results.length ? t("recent") : "";
    $("#food-list", s).innerHTML = results.length ? results.map(foodRow).join("") : q.value.trim() ? `<div class="empty small">${t("noResults")}</div>` : "";
  };
  draw();
  q.addEventListener("input", draw);
  s.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close]")) return closeSheet();
    if (ev.target.closest("#hint-toggle")) { $("#hint", s).hidden = false; ev.target.closest("#hint-toggle").hidden = true; return $("#hint", s).focus(); }
    if (ev.target.closest("#create")) return openResult(newDraft({ name: q.value.trim() }));
    const fr = ev.target.closest("[data-food]");
    if (fr) {
      const f = results[+fr.dataset.food];
      return openResult(newDraft({ name: f.name, nameEn: f.nameEn, kcal: f.kcal, protein: f.protein, carb: f.carb, fat: f.fat,
        low: f.low || 0, high: f.high || 0, items: f.items || [], photo: f.photo || null, note: f.unit ? `${t("perServing")} ${settings.lang === "en" ? UNIT_EN[f.unit] || f.unit : f.unit}` : "" }));
    }
    const b = ev.target.closest("[data-src]"); if (!b) return;
    pendingHint = $("#hint", s).value.trim();
    if (b.dataset.src === "barcode") return openScanSheet();
    if (!aiKey()) return toast(t("needAiKey"));
    if (b.dataset.src === "text") return openTextSheet(pendingHint);
    pendingMode = b.dataset.src === "label" ? "label" : "meal";
    $(b.dataset.src === "gallery" ? "#file-gallery" : "#file-camera").click();
  });
}

let stopScan = null;
function openScanSheet() {
  const s = openSheet(`
    <div class="sheet-head"><h2>${t("scanTitle")}</h2><button class="icon-btn" data-close>${IC.close}</button></div>
    <div class="scan-box"><video id="cam" playsinline muted></video><div class="scan-line"></div></div>
    <p class="small muted" id="scan-msg" style="text-align:center">${t("scanHelp")}</p>
    <div class="search-row"><input class="input" id="code" inputmode="numeric" placeholder="${esc(t("enterCode"))}" /><button class="btn btn-dark btn-sm" id="look">${t("lookup")}</button></div>`,
    { onClose: () => { stopScan?.(); stopScan = null; } });
  $("[data-close]", s).onclick = closeSheet;
  const go = (code) => { stopScan?.(); stopScan = null; lookup(code); };
  $("#look", s).onclick = () => { const c = $("#code", s).value.replace(/\D/g, ""); if (c.length >= 6) go(c); else $("#code", s).focus(); };
  if (navigator.mediaDevices?.getUserMedia) {
    startScanner($("#cam", s), (code) => { if (navigator.vibrate) navigator.vibrate(60); go(code); },
      () => { const m = $("#scan-msg"); if (m) m.textContent = t("camError"); }).then((stop) => {
      if (!document.body.contains(s)) stop(); else stopScan = stop;
    });
  } else $("#scan-msg", s).textContent = t("camError");
}

async function lookup(code) {
  openSheet(`<div class="loading"><div class="spinner"></div><div><b>${t("looking")}</b><div class="small muted num">${esc(code)}</div></div></div>`);
  try {
    const p = await lookupProduct(code);
    if (!p) { closeSheet(); return toast(t("notFound")); }
    if (!p.hasNutrition) { closeSheet(); return toast(t("noNutrition")); }
    openResult(newDraft({ name: p.name, nameEn: p.nameEn, kcal: p.kcal, protein: p.protein, carb: p.carb, fat: p.fat,
      note: `${t("perServing")} ${p.basis}${p.packageQty ? ` (${p.packageQty})` : ""} · ${t("fromOff")}`, barcode: code }));
  } catch (e) {
    closeSheet(); toast(t("errorPrefix") + e.message);
  }
}

function openTextSheet(prefill = "") {
  const s = openSheet(`
    <div class="sheet-head"><h2>${t("typeIt")}</h2><button class="icon-btn" data-close>${IC.close}</button></div>
    <textarea class="input" id="desc" rows="4" placeholder="${esc(t("describePh"))}">${esc(prefill)}</textarea>
    <div style="height:12px"></div>
    <button class="btn btn-dark" style="width:100%" id="go">${t("analyze")}</button>`);
  const ta = $("#desc", s); setTimeout(() => ta.focus(), 250);
  $("[data-close]", s).onclick = closeSheet;
  $("#go", s).onclick = () => {
    const text = ta.value.trim(); if (!text) return ta.focus();
    if (!aiKey()) return toast(t("needAiKey"));
    runAnalysis({ text });
  };
}

async function onPhotoPicked(file) {
  if (!file) return;
  try {
    const img = await loadImage(file);
    const big = drawScaled(img, 1280, 0.85);
    const thumb = drawScaled(img, 360, 0.72);
    runAnalysis({ imageB64: big.split(",")[1], photo: thumb, preview: big, text: pendingHint, mode: pendingMode });
  } catch (e) {
    toast(t("errorPrefix") + e.message);
  }
}

function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("cannot read image")); };
    img.src = url;
  });
}
function drawScaled(img, max, q) {
  const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
  c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

let analysisSeq = 0;
async function runAnalysis({ imageB64 = null, photo = null, preview = null, text = "", correction = null, previous = null, base = null, mode = "meal" }) {
  const seq = ++analysisSeq;
  const shown = preview || photo || base?.photo;
  openSheet(`
    ${shown ? `<div class="photo-wrap"><img src="${shown}" alt=""><button class="icon-btn close" data-close>${IC.close}</button></div>` : `<div class="sheet-head"><h2></h2><button class="icon-btn" data-close>${IC.close}</button></div>`}
    <div class="loading"><div class="spinner"></div><div><b>${t("analyzing")}</b><div class="small muted">${t("analyzingSub")}</div></div></div>`,
    { full: !!shown, onClose: () => { analysisSeq++; } });
  $("[data-close]").onclick = closeSheet;
  try {
    const r = await analyzeMeal({ provider: settings.provider, apiKey: aiKey(), imageB64, text, correction, previous, lang: settings.lang, mode });
    if (seq !== analysisSeq) return; // user closed the sheet
    if (!r.is_food) { closeSheet(); return toast(t("notFood")); }
    const now = new Date();
    const date = base?.date ?? (state.date === ymd(now) ? state.date : state.date);
    const time = base?.time ?? hhmm(now);
    const draft = {
      id: base?.id ?? null, date, time, meal: base?.meal ?? mealForTime(time),
      servings: base?.servings ?? 1, photo: photo ?? base?.photo ?? null,
      ...fromAi(r), ai: r, imageB64: imageB64 ?? base?.imageB64 ?? null, text: text || base?.text || "", mode,
    };
    openResult(draft, preview);
  } catch (e) {
    if (seq !== analysisSeq) return;
    closeSheet();
    toast(t("errorPrefix") + (e?.message || e));
  }
}

function fromAi(r) {
  const sum = (k) => r.items.reduce((s, i) => s + (Number(i[k]) || 0), 0);
  const kcal = Math.round(sum("kcal"));
  return {
    name: r.dish_th, nameEn: r.dish_en, kcal,
    low: Math.min(r.kcal_low, kcal), high: Math.max(r.kcal_high, kcal),
    protein: Math.round(sum("protein_g")), carb: Math.round(sum("carb_g")), fat: Math.round(sum("fat_g")),
    items: r.items.map((i) => ({ name: i.name_th, nameEn: i.name_en, kcal: Math.round(i.kcal) })), note: r.note || "",
  };
}

function openResult(draft, preview = null) {
  const d = { ...draft };
  const img = preview || d.photo;
  const editing = !!d.id;
  const s = openSheet(`
    ${img ? `<div class="photo-wrap"><img src="${img}" alt=""><button class="icon-btn close" data-close>${IC.close}</button>
      <div class="tags">${(d.items || []).slice(0, 4).map((i) => `<div class="tag"><div class="n">${esc(settings.lang === "en" ? i.nameEn || i.name : i.name)}</div><div class="k num">${fmt(i.kcal)} <small>${t("kcal")}</small></div></div>`).join("")}</div></div>`
      : `<div class="sheet-head"><h2></h2><button class="icon-btn" data-close>${IC.close}</button></div>`}
    <div class="result-body">
      <div class="result-top">
        <select class="meal-sel" id="meal">${MEALS.map((m) => `<option value="${m}" ${m === d.meal ? "selected" : ""}>${mealLabel(m)}</option>`).join("")}</select>
        <div class="stepper"><button id="minus" aria-label="-">−</button><span id="serv" class="num">${d.servings}</span><button id="plus" aria-label="+">+</button></div>
      </div>
      <input class="dish-name" id="name" value="${esc(d.name)}" placeholder="${esc(t("newFood"))}" />
      <input class="dish-en" id="nameEn" value="${esc(d.nameEn || "")}" placeholder="English name" />
      <div class="kcal-big num"><span id="kbig"></span> <small>${t("kcal")}</small></div>
      <div class="range num" id="range"></div>
      ${(d.items || []).length > 1 ? `<div class="items">${d.items.map((i) => `<span class="chip">${esc(settings.lang === "en" ? i.nameEn || i.name : i.name)} <b class="num">${fmt(i.kcal)}</b> ${t("kcal")}</span>`).join("")}</div>` : `<div style="height:14px"></div>`}
      ${d.note ? `<div class="note">${esc(d.note)}</div>` : ""}
      <div class="tiles">
        ${tile("kcal", t("energy"), t("kcal"), "#fbf1d6", IC.flame("#c98a00"))}
        ${tile("carb", t("carb"), t("g"), "#e3f4e9", IC.fork("#2f9e5b"))}
        ${tile("protein", t("protein"), t("g"), "#fde6e7", IC.fish("#e5484d"))}
        ${tile("fat", t("fat"), t("g"), "#e1effc", IC.drop("#1e88e5"))}
      </div>
      <div class="grid2">
        <label class="field"><span>${t("date")}</span><input class="input" type="date" id="date" value="${d.date}"></label>
        <label class="field"><span>${t("time")}</span><input class="input" type="time" id="time" value="${d.time}"></label>
      </div>
      <div class="btn-row">
        <button class="btn btn-light" id="fix" ${d.ai ? "" : "disabled"}>${IC.pencil}${t("fixResult")}</button>
        <button class="btn btn-dark" id="save">${t("save")}</button>
      </div>
      ${editing ? `<button class="btn btn-danger" style="width:100%;margin-top:6px" id="del">${t("del")}</button>` : ""}
    </div>`, { full: !!img });

  function tile(key, label, unit, bg, icon) {
    return `<div class="tile"><div class="ic" style="background:${bg}">${icon}</div><div style="min-width:0"><div class="l">${label}</div>
      <div style="display:flex;align-items:baseline;gap:3px"><input class="num" inputmode="decimal" data-k="${key}"><span class="u">${unit}</span></div></div></div>`;
  }
  const refresh = () => {
    $("#serv", s).textContent = d.servings;
    $("#kbig", s).textContent = fmt(d.kcal * d.servings);
    $("#range", s).textContent = d.low && d.high ? `${t("maybe")} ${fmt(d.low * d.servings)}–${fmt(d.high * d.servings)} ${t("kcal")}` : "";
    s.querySelectorAll("[data-k]").forEach((inp) => { if (document.activeElement !== inp) inp.value = fmt(d[inp.dataset.k] * d.servings).replace(/,/g, ""); fit(inp); });
  };
  refresh();

  function fit(inp) { inp.style.width = Math.max(2, inp.value.length + 0.6) + "ch"; }
  s.querySelectorAll("[data-k]").forEach((inp) => inp.addEventListener("input", () => {
    fit(inp);
    const k = inp.dataset.k, v = Number(inp.value) || 0;
    const prev = d[k]; d[k] = v / d.servings;
    if (k === "kcal" && prev) { d.low = d.low * d[k] / prev; d.high = d.high * d[k] / prev; }
    $("#kbig", s).textContent = fmt(d.kcal * d.servings);
    $("#range", s).textContent = d.low && d.high ? `${t("maybe")} ${fmt(d.low * d.servings)}–${fmt(d.high * d.servings)} ${t("kcal")}` : "";
  }));
  $("#minus", s).onclick = () => { d.servings = Math.max(0.5, d.servings - 0.5); refresh(); };
  $("#plus", s).onclick = () => { d.servings = Math.min(20, d.servings + 0.5); refresh(); };
  $("[data-close]", s).onclick = closeSheet;
  $("#save", s).onclick = () => {
    if (!$("#name", s).value.trim()) { toast(t("needName")); return $("#name", s).focus(); }
    Object.assign(d, {
      meal: $("#meal", s).value, name: $("#name", s).value.trim() || d.name, nameEn: $("#nameEn", s).value.trim(),
      date: $("#date", s).value || d.date, time: $("#time", s).value || d.time,
    });
    const rec = {
      id: d.id || uid(), date: d.date, time: d.time, meal: d.meal, name: d.name, nameEn: d.nameEn,
      kcal: d.kcal, low: d.low, high: d.high, protein: d.protein, carb: d.carb, fat: d.fat,
      servings: d.servings, items: d.items || [], note: d.note || "", photo: d.photo || null, ai: d.ai || null, text: d.text || "",
    };
    const i = entries.findIndex((e) => e.id === rec.id);
    if (i >= 0) entries[i] = rec; else entries.push(rec);
    if (!saveEntries()) { // probably quota: retry without the photo
      rec.photo = null; if (i >= 0) entries[i] = rec; else entries[entries.length - 1] = rec;
      if (!saveEntries()) return;
    }
    state.date = rec.date; state.tab = "home";
    closeSheet(); render(); toast(t("saved"));
  };
  $("#fix", s).onclick = () => openFixSheet(d);
  if (editing) $("#del", s).onclick = () => {
    entries = entries.filter((e) => e.id !== d.id); saveEntries(); closeSheet(); render(); toast(t("deleted"));
  };
}

function openFixSheet(d) {
  const back = { ...d };
  const s = openSheet(`
    <div class="sheet-head"><h2>${t("fixResult")}</h2><button class="icon-btn" data-close>${IC.close}</button></div>
    <textarea class="input" id="fixtxt" rows="3" placeholder="${esc(t("fixPh"))}"></textarea>
    <div style="height:12px"></div>
    <div class="btn-row"><button class="btn btn-light" id="cancel">${t("cancel")}</button><button class="btn btn-dark" id="go">${t("reanalyze")}</button></div>`);
  const ta = $("#fixtxt", s); setTimeout(() => ta.focus(), 250);
  const goBack = () => openResult(back);
  $("[data-close]", s).onclick = goBack; $("#cancel", s).onclick = goBack;
  $("#go", s).onclick = () => {
    const c = ta.value.trim(); if (!c) return ta.focus();
    if (!aiKey()) return toast(t("needAiKey"));
    runAnalysis({ imageB64: back.imageB64 || null, text: back.text, correction: c, previous: back.ai, base: back, mode: back.mode || "meal" });
  };
}

function openWeightSheet() {
  const last = [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const s = openSheet(`
    <div class="sheet-head"><h2>${t("logWeight")}</h2><button class="icon-btn" data-close>${IC.close}</button></div>
    <div class="grid2">
      <label class="field"><span>${t("weight")}</span><input class="input" id="kg" type="number" step="0.1" inputmode="decimal" value="${last?.kg ?? settings.body.weight}"></label>
      <label class="field"><span>${t("date")}</span><input class="input" id="wdate" type="date" value="${ymd(new Date())}"></label>
    </div>
    <button class="btn btn-dark" style="width:100%" id="go">${t("save")}</button>`);
  $("[data-close]", s).onclick = closeSheet;
  $("#go", s).onclick = () => {
    const kg = Number($("#kg", s).value), date = $("#wdate", s).value || ymd(new Date());
    if (!(kg > 20 && kg < 400)) return $("#kg", s).focus();
    weights = weights.filter((w) => w.date !== date).concat({ date, kg });
    saveWeights();
    const latest = [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
    settings.body.weight = latest.kg; saveSettings();
    closeSheet(); render(); toast(t("weightSaved"));
  };
}

/* ============================== events ============================== */
document.querySelector(".tabs").addEventListener("click", (e) => {
  const b = e.target.closest(".tab"); if (!b) return;
  if (state.tab === "profile") { readProfileForm(); saveSettings(); }
  state.tab = b.dataset.tab; render();
});
$("#fab").addEventListener("click", openAddSheet);
$("#file-camera").addEventListener("change", (e) => { onPhotoPicked(e.target.files[0]); e.target.value = ""; });
$("#file-gallery").addEventListener("change", (e) => { onPhotoPicked(e.target.files[0]); e.target.value = ""; });

$("#view").addEventListener("click", (e) => {
  const day = e.target.closest("[data-date]");
  if (day) { state.date = day.dataset.date; return render(); }
  const en = e.target.closest("[data-entry]");
  if (en) { const rec = entries.find((x) => x.id === en.dataset.entry); if (rec) openResult({ ...rec }); return; }
  if (e.target.closest("#btn-weight")) return openWeightSheet();
  const lang = e.target.closest("[data-lang]");
  if (lang) { readProfileForm(); settings.lang = lang.dataset.lang; saveSettings(); return render(); }
  const prov = e.target.closest("[data-prov]");
  if (prov) { readProfileForm(); settings.provider = prov.dataset.prov; saveSettings(); return render(); }
  const sex = e.target.closest("[data-sex]");
  if (sex) { readProfileForm(); settings.body.sex = sex.dataset.sex; saveSettings(); return render(); }
  if (e.target.closest("#btn-recalc")) {
    readProfileForm(); settings.goals = computeGoals(settings.body); saveSettings(); render(); return toast(t("settingsSaved"));
  }
  if (e.target.closest("#btn-export")) return exportData();
  if (e.target.closest("#btn-import")) return $("#file-import").click();
  if (e.target.closest("#btn-clear")) {
    if (confirm(t("confirmClear"))) {
      entries = []; weights = []; const lang = settings.lang;
      settings = defaultSettings(); settings.lang = lang; settings.goals = computeGoals(settings.body);
      saveEntries(); saveWeights(); saveSettings(); render();
    }
  }
});
$("#view").addEventListener("submit", (e) => {
  e.preventDefault(); readProfileForm(); saveSettings(); render(); toast(t("settingsSaved"));
});
$("#view").addEventListener("change", (e) => {
  if (e.target.closest("#profile-form")) { readProfileForm(); saveSettings(); }
});

function exportData() {
  const blob = new Blob([JSON.stringify({ app: "kindee", version: 1, exportedAt: new Date().toISOString(), settings: { ...settings, apiKey: "", geminiKey: "" }, entries, weights })], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `kindee-backup-${ymd(new Date())}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
$("#file-import").addEventListener("change", async (e) => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  try {
    const data = JSON.parse(await f.text());
    if (data.app !== "kindee" || !Array.isArray(data.entries)) throw new Error();
    const key = settings.apiKey;
    const gk = settings.geminiKey;
    settings = { ...defaultSettings(), ...data.settings, apiKey: key, geminiKey: gk };
    entries = data.entries; weights = data.weights || [];
    saveSettings(); saveEntries(); saveWeights(); render(); toast(t("imported"));
  } catch { toast(t("importFail")); }
});

// Re-render at midnight / when returning to the app so "today" stays right.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !document.body.classList.contains("sheet-open")) {
    const today = ymd(new Date());
    if (state.date > today) state.date = today;
    if (state.tab !== "profile") render();
  }
});

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

saveSettings();
render();
