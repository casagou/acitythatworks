# A City That Works — v1.3 Website

Single-file deployable website for the citizens' framework. Drag the folder onto Netlify and you're live.

## Deploy in 3 steps

1. **[app.netlify.com/drop](https://app.netlify.com/drop)** — drag this folder onto the drop zone (sign in first if needed).
2. Site is live immediately at a random `*.netlify.app` subdomain.
3. Rename to `acitythatworks.netlify.app` in **Site settings → Domain management → Edit site name**.
4. Once you register `acitythatworks.ca`, add it in **Domain management → Add custom domain**. Netlify auto-provisions Let's Encrypt SSL.

## What's included

- **`index.html`** — complete website. Single file, no build step. All HTML, CSS, JS, and 100 measure entries inline.
- **`README.md`** — this file.

That's it. Two files. No package.json, no node_modules, no build pipeline.

## Features

**Desktop:**
- Sticky top nav with 7 section links + Endorse button
- Filter chips and full-text search on the Measures section
- Sticky filter bar that stays accessible while scrolling through measures

**Mobile:**
- Hamburger menu in the header
- Floating "Jump to…" button appears after scrolling past the hero
- Bottom-sheet drawer with 8 quick-jump links
- Horizontal-scrolling filter chips (touch-friendly)
- Scorecard renders as cards (not tables) for narrow viewports

**Both:**
- All 100 measures with title, summary, and budget impact
- Filter by pillar (Foundation, Liveable, Safe, Beautiful, Well-Managed, Democratic)
- Search across measure titles, bodies, budgets, and IDs (e.g. "M53" or "STR" or "Pittsburgh")
- 6 Documents cards linking to Notion
- 12-commitments scorecard
- Balance Sheet with tax glide path
- FAQ accordion with 8 honest answers
- Netlify Forms email capture
- Open Graph + Twitter Card meta
- iOS safe-area insets respected
- Print stylesheet

## Email capture

The form is wired to **Netlify Forms**:
1. After deploy, go to your Netlify site → **Forms** tab
2. Confirm the `newsletter` form was detected
3. **Forms → Settings & usage → Form notifications** → add your email (e.g. `info@acitythatworks.ca`)
4. Free tier: 100 submissions/month. Plenty for early traction.

## Updating content

All measure data lives in the JavaScript arrays at the bottom of `index.html`:

- **`MEASURES`** — array of 100 measures with `{id, pillar, section, tier, title, body, budget}`
- **`COMMITMENTS`** — array of 12 scorecard targets
- **`FAQ`** — array of 8 Q&A entries
- **`PILLARS`** — the 6 pillar definitions (color, emoji, label, description)

Edit directly in the file. No build, no transpile. Save and re-drag the folder into Netlify when you're ready.

## Note on measure descriptions

Each measure on the website is a concise summary (1–3 sentences). The full text — context, sources, sub-bullets, peer-city citations — lives in the Notion master, linked prominently from the Documents section. The website is the gateway; Notion is the record.

## Customization

CSS variables at the top of `<style>`:

```css
--navy:  #1A3668;  /* primary */
--gold:  #D4A843;  /* accent */
--paper: #FAF7F0;  /* background */
--rust:  #B5341F;  /* diagnostic stats */
--moss:  #227247;  /* positive principles */
```

## Performance

- ~95KB HTML total, including all CSS, JS, and 100 measure entries
- First paint < 1s on any modern connection
- No external CSS framework (no Tailwind CDN bloat)
- Only external resource is Google Fonts (3 families)
