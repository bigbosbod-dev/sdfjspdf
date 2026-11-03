# กินดี (KinDee): personal calorie tracker

A calorie-counting web app (PWA) for personal use. Take a photo of your food and Claude estimates calories, protein, carbs and fat. The UI works in Thai and English.

## Features (all usable for free)
- **Thai food search**: a built-in list of about 250 common dishes and drinks (approximate values). Anything you've logged before also shows up in search and under "Recent".
- **Barcode scan**: looks up packaged products in Open Food Facts (a free, open database). You can type the number if the camera doesn't work.
- **Create your own food**: enter the name and calories yourself. It becomes searchable next time.
- **AI photo / label / text analysis**: free with **Google Gemini** (free tier with daily limits), or Claude (paid) if you prefer. Each dish gets a calorie estimate, a likely range, and macros.
- **Fix result**: tell the AI what was wrong and it recalculates. You can also edit the numbers directly.
- **Home**: remaining calories, protein/carbs/fat rings, a 7-day calendar, and the day's log grouped by meal.
- **Progress**: day streak, weight log, weight trend chart, estimated date to reach your goal, and a 7-day calorie chart.
- **Profile**: TDEE and daily targets calculated from your body data (Mifflin–St Jeor), API key, language, and JSON backup/import.
- Data is stored only in your browser's `localStorage`. There is no server.

## Usage
1. (Optional, for AI photo analysis) Get a free Gemini API key at https://aistudio.google.com/apikey (no card needed). Google may use data from free-tier requests to improve its products. Claude (https://platform.claude.com) also works but is billed per use.
2. Host these files on any HTTPS host, e.g. **GitHub Pages**: Settings → Pages → Deploy from branch → choose the branch and `/ (root)`.
3. Open the URL on your iPhone in Safari → Share → **Add to Home Screen**.
4. On the "ฉัน" (Profile) page, choose the AI provider, enter your key and body data, then tap "คำนวณจากข้อมูลร่างกาย" (calculate from body data).

To run locally: `python3 -m http.server` then open http://localhost:8000

## Files
- `index.html`, `styles.css`, `app.js`: UI and logic
- `ai.js`: AI analysis (Gemini: auto-picks a Flash model your key can use and falls back to another when quota runs out; Claude: `claude-opus-5-5`)
- `foods.js`: built-in Thai food list
- `barcode.js`: camera barcode scanning + Open Food Facts lookup
- `sw.js`, `manifest.webmanifest`, `icons/`: PWA / offline support

> API keys are stored only in this browser and sent only to the AI provider you chose. Don't put keys in the code.
> Data lives only on this device. Use "สำรองข้อมูล" (Back up data) on the Profile page regularly.
