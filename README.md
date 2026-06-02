# Wedding Invitation

A config-driven, animated wedding invitation built with **Next.js 15** (App Router), **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**.

---

## Quick Start

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). Defaults to the **classic** version.

---

## Switching Versions

### Option 1 — Environment variable (production / default)

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_INVITE_VERSION=classic   # or: minimal  |  warm
```

Restart the dev server. The selected version loads automatically.

### Option 2 — URL preview param (development only)

Append `?v=<version-id>` to the URL while the dev server is running:

```
http://localhost:3000?v=minimal
http://localhost:3000?v=warm
```

URL params take priority over the env variable, making it easy to demo all three versions side-by-side without restarting.

---

## Available Versions

| ID        | Title             | Fonts                            | Description                        |
|-----------|-------------------|----------------------------------|------------------------------------|
| `classic` | Classic Romantic  | Playfair Display + EB Garamond   | Warm ivory/gold, 5 stages          |
| `minimal` | Modern Minimal    | DM Sans                          | Clean dark, per-stage backgrounds  |
| `warm`    | Warm Bohemian     | Cormorant Garamond + Lato        | Deep terracotta, 5 stages          |

---

## Adding a New Version

1. **Create the config file** at `data/versions/<id>.json`. The schema is validated with Zod — see `lib/versionSchema.ts` for all required fields.
2. **Add background image(s)** to `public/backgrounds/`. Any web-compatible format works (SVG, JPEG, PNG, WebP).
3. **Register the ID** in the `ALLOWED_VERSIONS` array in `lib/loadVersionConfig.ts`.
4. Set `NEXT_PUBLIC_INVITE_VERSION=<id>` or use `?v=<id>` to preview.

### Minimal JSON template

```json
{
  "id": "your-id",
  "title": "Version Title",
  "theme": {
    "primaryColor": "#1a1a1a",
    "textColor": "#f0f0f0",
    "accentColor": "#c0a060",
    "fontHeading": "var(--font-playfair), Georgia, serif",
    "fontBody": "var(--font-garamond), Georgia, serif"
  },
  "background": "/backgrounds/your-image.jpg",
  "stages": [
    {
      "heading": "Stage Heading",
      "subheading": "optional subheading",
      "meta": ["optional line 1", "optional line 2"],
      "animationPreset": "fade-up",
      "timing": { "duration": 0.9, "delay": 0 }
    }
  ]
}
```

### Available animation presets

| Preset          | Effect                              |
|-----------------|-------------------------------------|
| `fade`          | Simple opacity fade in              |
| `fade-up`       | Fade in while rising 28 px          |
| `blur-to-clear` | Blur dissolves away as text appears |

### Available font variables

| CSS variable             | Font name            |
|--------------------------|----------------------|
| `var(--font-playfair)`   | Playfair Display     |
| `var(--font-garamond)`   | EB Garamond          |
| `var(--font-dm-sans)`    | DM Sans              |
| `var(--font-cormorant)`  | Cormorant Garamond   |
| `var(--font-lato)`       | Lato                 |

To add a different font, import it in `app/layout.tsx` with `next/font/google` and expose it as a CSS variable.

---

## Interaction

| Action               | Behaviour       |
|----------------------|-----------------|
| Click / tap anywhere | Next stage      |
| Swipe up             | Next stage      |
| Swipe down           | Previous stage  |
| `→` / `↓` / `Space` | Next stage      |
| `←` / `↑`           | Previous stage  |
| **Back** button      | Previous stage  |
| **Continue** button  | Next stage      |

Supports `prefers-reduced-motion` — all entrance animations fall back to a plain opacity fade.

---

## Project Structure

```
├── app/
│   ├── globals.css          Base styles
│   ├── layout.tsx           Root layout, font loading
│   └── page.tsx             Server component — loads config, renders invitation
├── components/
│   ├── AnimatedText.tsx     Framer Motion text with preset animations
│   ├── ErrorUI.tsx          Graceful error screen for bad configs
│   ├── StageIndicator.tsx   Dot-bar + numeric stage counter
│   └── StageRenderer.tsx    Client component — stage state, navigation, layout
├── data/
│   └── versions/
│       ├── classic.json
│       ├── minimal.json
│       └── warm.json
├── lib/
│   ├── loadVersionConfig.ts Config resolver (env var → URL param → default)
│   └── versionSchema.ts     Zod schema + exported TypeScript types
└── public/
    └── backgrounds/         Static background images (SVG / JPEG / PNG / WebP)
```

---

## Deploying

### Vercel (recommended)

```bash
npm run build
```

Set `NEXT_PUBLIC_INVITE_VERSION` in the Vercel dashboard → **Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
npm start
```

Set `NEXT_PUBLIC_INVITE_VERSION` in your process environment before starting.

### Static export (optional)

If you don't need the `?v=` preview feature, you can export a fully static site:

1. Add `output: 'export'` to `next.config.ts`.
2. Run `npm run build`.
3. Serve the `out/` directory from any CDN.

> **Note:** Remove the `searchParams` prop from `app/page.tsx` and rely solely on the env variable when targeting static export, as URL search params are not available at build time.
