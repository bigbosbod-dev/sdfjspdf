# กินดี (KinDee): personal calorie tracker

A calorie-counting web app (PWA) for personal use. Take a photo of your food and Claude estimates calories, protein, carbs and fat. The UI works in Thai and English.

## Features
- **Photo / text analysis**: snap a meal or type what you ate. Each dish gets a calorie estimate, a likely range, and macros. You can add a hint like "ate half" to improve accuracy.
- **Fix result**: tell the AI what was wrong and it recalculates. You can also edit the numbers directly.
- **Home**: remaining calories, protein/carbs/fat rings, a 7-day calendar, and the day's log grouped by meal.
- **Progress**: day streak, weight log, weight trend chart, estimated date to reach your goal, and a 7-day calorie chart.
- **Profile**: TDEE and daily targets calculated from your body data (Mifflin–St Jeor), API key, language, and JSON backup/import.
- Data is stored only in your browser's `localStorage`. There is no server.

## Usage
1. Get an API key from https://platform.claude.com (it is billed per use).
2. Host these files on any HTTPS host, e.g. **GitHub Pages**: Settings → Pages → Deploy from branch → choose the branch and `/ (root)`.
3. Open the URL on your iPhone in Safari → Share → **Add to Home Screen**.
4. On the "ฉัน" (Profile) page, enter your API key and body data, then tap "คำนวณจากข้อมูลร่างกาย" (calculate from body data).

To run locally: `python3 -m http.server` then open http://localhost:8000

## Files
- `index.html`, `styles.css`, `app.js`: UI and logic
- `ai.js`: Claude API calls (model `claude-opus-5-5`, structured JSON output)
- `sw.js`, `manifest.webmanifest`, `icons/`: PWA / offline support

> The API key is stored in this browser and sent only to api.anthropic.com. Don't put the key in the code.
> Data lives only on this device. Use "สำรองข้อมูล" (Back up data) on the Profile page regularly.
