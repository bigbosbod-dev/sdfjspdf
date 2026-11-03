// Barcode scanning (camera) + product lookup on Open Food Facts (free, open database).

const ZXING_URL = "https://cdn.jsdelivr.net/npm/@zxing/browser@0.2.1/+esm";
const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

/**
 * Start scanning into a <video>. Calls onCode(code) once. Returns stop().
 */
export async function startScanner(video, onCode, onError) {
  let stopped = false, stopFn = () => {};
  const done = (code) => { if (stopped) return; stopped = true; stopFn(); onCode(code); };

  if ("BarcodeDetector" in window) {
    try {
      const supported = await window.BarcodeDetector.getSupportedFormats();
      const det = new window.BarcodeDetector({ formats: FORMATS.filter((f) => supported.includes(f)) });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      video.srcObject = stream; video.setAttribute("playsinline", ""); await video.play();
      let raf;
      const tick = async () => {
        if (stopped) return;
        try { const r = await det.detect(video); if (r[0]?.rawValue) return done(r[0].rawValue); } catch {}
        raf = setTimeout(tick, 200);
      };
      stopFn = () => { clearTimeout(raf); stream.getTracks().forEach((t) => t.stop()); };
      tick();
      return () => { stopped = true; stopFn(); };
    } catch { /* fall through to ZXing */ }
  }

  try {
    const { BrowserMultiFormatReader } = await import(ZXING_URL);
    const reader = new BrowserMultiFormatReader();
    const controls = await reader.decodeFromConstraints(
      { video: { facingMode: "environment" }, audio: false }, video,
      (result) => { if (result) done(result.getText()); },
    );
    stopFn = () => controls.stop();
    if (stopped) stopFn();
    return () => { stopped = true; stopFn(); };
  } catch (e) {
    onError?.(e);
    return () => {};
  }
}

/** Look up a barcode. Returns null if not found. Values are per serving when known, otherwise per 100 g/ml. */
export async function lookupProduct(code) {
  const fields = "code,product_name,product_name_th,product_name_en,brands,nutriments,serving_size,serving_quantity,quantity,image_front_small_url";
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${fields}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts ${res.status}`);
  const j = await res.json();
  if (j.status !== 1 || !j.product) return null;
  const p = j.product, n = p.nutriments || {};
  const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));
  const kcal100 = num(n["energy-kcal_100g"]) ?? (num(n.energy_100g) != null ? num(n.energy_100g) / 4.184 : null);
  const per100 = { kcal: kcal100, protein: num(n.proteins_100g), carb: num(n.carbohydrates_100g), fat: num(n.fat_100g) };
  const qty = num(p.serving_quantity);
  const hasNutrition = per100.kcal != null || num(n["energy-kcal_serving"]) != null;
  let v, basis;
  if (qty && per100.kcal != null) {
    const f = qty / 100;
    v = { kcal: per100.kcal * f, protein: (per100.protein || 0) * f, carb: (per100.carb || 0) * f, fat: (per100.fat || 0) * f };
    basis = p.serving_size || `${qty} g`;
  } else if (num(n["energy-kcal_serving"]) != null) {
    v = { kcal: num(n["energy-kcal_serving"]), protein: num(n.proteins_serving) || 0, carb: num(n.carbohydrates_serving) || 0, fat: num(n.fat_serving) || 0 };
    basis = p.serving_size || "1 serving";
  } else {
    v = { kcal: per100.kcal || 0, protein: per100.protein || 0, carb: per100.carb || 0, fat: per100.fat || 0 };
    basis = "100 g/ml";
  }
  const name = p.product_name_th || p.product_name || p.product_name_en || code;
  return {
    code, hasNutrition, basis, packageQty: p.quantity || "",
    name: (() => { const br = p.brands?.split(",")[0]?.trim(); return br && !name.toLowerCase().includes(br.toLowerCase()) ? `${name} · ${br}` : name; })(),
    nameEn: p.product_name_en || (p.product_name_th ? p.product_name : "") || "",
    kcal: Math.round(v.kcal), protein: +v.protein.toFixed(1), carb: +v.carb.toFixed(1), fat: +v.fat.toFixed(1),
  };
}
