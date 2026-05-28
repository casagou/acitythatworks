# A City That Works — Website (v1.3)

A complete, multi-page static website for the citizens' framework. No build step, no dependencies. Drag the folder onto Netlify and it's live.

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | Home — hero, pillars, method, **all 100 measures** (filterable + searchable, full text inline), 12-commitment scorecard, balance sheet, principles, criticisms Q&A, subscribe/endorse |
| `savings.html` | Savings & Revenue Analysis — the full math, every table, with sources and caveats |
| `city-hall.html` | How City Hall Actually Works — plain-language guide to municipal power |
| `endorse.html` | Candidate Endorsement Pack — three tiers, campaign language, full measure checklist, endorsement form |
| `comparison.html` | Candidate Comparison Matrix — every 2026 candidate scored against the framework |
| `faq.html` | Frequently Asked Questions — the full skeptic's Q&A |
| `styles.css` | Shared stylesheet for every page |
| `site.js` | Shared footer (contact + social) and mobile-menu logic, injected on every page |
| `measures.js` | The 100 measures + scorecard + pillar data and all rendering for the home page |

Everything from the framework hub is included **except** the internal/archival pages (Version History, the v1.1/v1.2 archive snapshots, and the Brand Assets page), which aren't public-facing content.

## Deploy in 3 steps

1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)** and drag this whole folder onto the drop zone.
2. It's live immediately at a random `*.netlify.app` URL.
3. Rename it to `acitythatworks.netlify.app` in **Site settings → Domain management → Edit site name**.

**Updating an existing Netlify site:** open your site → **Deploys** tab → drag the folder onto "Drag and drop your site output folder here."

### Custom domain
Once `acitythatworks.ca` is registered, add it under **Domain management → Add custom domain**. Netlify auto-provisions HTTPS (Let's Encrypt).

## Email capture (Netlify Forms)

The subscribe box on the home page is wired to **Netlify Forms** (form name: `newsletter`).
1. After deploy, open your site → **Forms** tab and confirm the `newsletter` form was detected.
2. **Forms → Settings & usage → Form notifications** → add the address that should receive sign-ups (e.g. `info@acitythatworks.ca`).
3. Free tier: 100 submissions/month.

## Contact details baked into the site

- **Email:** info@acitythatworks.ca
- **Instagram / X / Facebook:** @CityThatWorksYYJ

All four live in `site.js` (footer) and on the home page's Endorse section. To change any of them later, **edit `site.js` once** — the footer is shared across all six pages.

> ⚠️ `info@acitythatworks.ca` only works once the domain is registered and a mailbox/forwarder is set up. Until then, mail to it will bounce. If you want a working address before the domain is live, search-and-replace `info@acitythatworks.ca` in `site.js`, `index.html`, `endorse.html`, `comparison.html`, and `faq.html`.

## Editing content later

- **Measures, scorecard, pillars** → `measures.js` (plain data arrays at the top; rendering below).
- **Criticisms Q&A on the home page** → the `FAQ` array in `measures.js`.
- **Everything else** → edit the relevant `.html` file directly. No build, no transpile — save and re-drag the folder into Netlify.

## Notes

- Pure static HTML/CSS/JS. The only external resource is Google Fonts.
- Works fully on desktop and mobile: sticky top nav on desktop, hamburger menu on mobile, a floating "Jump to…" drawer on the home page, touch-friendly filter chips, and a scorecard that switches from a table to cards on small screens.
- iOS safe-area insets respected; print stylesheet included.
