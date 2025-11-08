# 🏪 Mini POS System

<div align="center">

[![Made by Codecraft](https://img.shields.io/badge/Made%20by-Codecraft%20by%20Syed-blue)](https://codecraftbysyed-portfolio.vercel.app/)
[![Built with Tailwind](https://img.shields.io/badge/Built%20with-Tailwind%20CSS-38B2AC)](https://tailwindcss.com)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Live Demo](https://craftbysyed-portfolio.vercel.app) | [Portfolio](https://codecraftbysyed-portfolio.vercel.app/)

A lightweight, elegant Point of Sale system built with pure JavaScript and Tailwind CSS.

This is a "vibe coding" project — built for fun, experimentation, and expressive UI work.

</div>

## ✨ Features

- 💼 **Product Management** - Add, edit, and organize your inventory
- 🛒 **POS Interface** - Smooth, intuitive point-of-sale experience
- 📊 **Reporting** - Track sales and analyze performance
- 💸 **Indian Rupee (₹)** - Fully configured for Indian currency
- 🚀 **Offline Support** - Works without internet via Service Worker
- 🎨 **Modern UI** - Clean interface styled with Tailwind CSS

## 📥 Download

You can provide a downloadable ZIP of the app (for example `mini-pos.zip`) under your portfolio or releases. A download button has been added to the app header and points to:

`download/`

Replace the URL above with your actual release or ZIP location.

## Branding
This fork/app is branded "Codecraft by Syed". The footer and header show the brand name and a round logo (`images/logo.svg`).

## Currency
All displayed currency values now use the Indian Rupee symbol (₹). The codebase replaces previous `$` signs with `₹` in the UI and templates.

Files updated for currency:
- `index.html` (dashboard totals default set to `₹0.00`)
- `pos.html` (grand total default set to `₹0.00`)
- `products.html` (price label shows `Price (₹)`)
- JS files: `js/pos.js`, `pos.js`, `js/products.js`, `js/reports.js`, `js/dashboard.js` — replaced `$` currency prefixes with `₹` in UI templates and summaries.

Notes for developers:
- Currency parsing/serialization: the app strips the first character when reading totals (e.g. `grandTotalEl.textContent.slice(1)`) so using a single-character currency symbol like `₹` keeps that logic working. If you change parsing logic later, update these slices accordingly.

## Screenshots
Placeholder screenshots are included in `images/screenshots/`:
- `images/screenshots/screenshot-1.svg` — Dashboard (placeholder)
- `images/screenshots/screenshot-2.svg` — POS / Cart (placeholder)
- `images/screenshots/screenshot-3.svg` — Products list (placeholder)

Replace these with real PNG/SVG screenshots by saving files into that folder and committing.

## Local development
This project uses locally compiled Tailwind CSS. To rebuild or watch CSS changes:

Install (already done in this workspace):

```powershell
npm install
```

Build once (produces `css/style.css`):

```powershell
npx tailwindcss -i ./src/input.css -o ./css/style.css --minify
```

Watch mode (rebuilds on change):

```powershell
npm run dev
```

Open the app (for example) with Live Server or a static server at `http://127.0.0.1:5500/`.

## Service worker / CORS note
The service worker previously attempted to cache the Tailwind CDN URL which caused a CORS fetch failure. The worker now only caches local assets and is resilient to individual asset cache failures. If you see old SW behavior, unregister the service worker in DevTools and reload.

## How to replace the logo
Replace `images/logo.svg` with your final logo (keep the filename or update `index.html`/footers accordingly). The UI expects a round logo (uses `rounded-full` class) — square or circular SVG/PNG works fine.

## 👨‍💻 About the Creator

<div align="center">

### Codecraft by Syed

[🌐 Portfolio](https://codecraftbysyed-portfolio.vercel.app/) | [💼 LinkedIn](#) | [🐙 GitHub](#)

Creating elegant web solutions with a focus on user experience and clean code.

</div>

## 📝 License

This project is [MIT](LICENSE) licensed.

---

<div align="center">

Made with ❤️ by [Codecraft by Syed](https://codecraftbysyed-portfolio.vercel.app/)

**[⬆ Back to Top](#-mini-pos-system)**

</div>

