# A City That Works — Website (v1.9.1)

A complete, multi-page static website for the citizens' framework. No build step, no dependencies. Lives at **[acitythatworks.ca](https://acitythatworks.ca)**, auto-deployed from this repo via Netlify on every push to `main`.

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | Home — hero, diagnostic, five pillars (linking into Every Measure pre-filtered), method, 12-commitment scorecard, balance sheet, principles, criticisms Q&A, subscribe/endorse |
| `measures.html` | Every Measure — all 131 measures, filterable by pillar and searchable by keyword, full text and budget impact inline, each one individually linkable as `#m48`. Reached from every page's nav as "Measures" |
| `summary.html` | One-Page Summary — the 60-second version (problem → pillars → flagship measures → math → method), plus the printable PDF download |
| `A-City-That-Works-One-Page.pdf` | The printable one-pager, linked from `summary.html`. Designed separately; drop a new file in at the same path to update the download |
| `savings.html` | Savings & Revenue Analysis — the full math, every table, with sources and honest caveats |
| `city-hall.html` | How City Hall Actually Works — plain-language guide to municipal power |
| `endorse.html` | Candidate Endorsement Pack — three tiers, campaign language, full measure checklist, endorsement form |
| `comparison.html` | Candidate Comparison Matrix — every 2026 candidate scored against the framework |
| `faq.html` | Frequently Asked Questions — the full skeptic's Q&A |
| `styles.css` | Shared stylesheet for every page (includes the sticky section navigator and print rules) |
| `charts.css` | Chart styles — CSS bars and the glide-path SVG. Linked from `index.html` and `summary.html` |
| `jumpnav.js` | The sticky section navigator, shared by every long page. A page opts in with the `#jumpsel` markup; the option list builds itself from the page's headings |
| `scorecard.html` | Candidate Scorecard — filterable grade table |
| `version-history.html` | Every dated change to the framework |
| `site.js` | Shared footer (contact + social) and mobile-menu logic, injected on every page |
| `flags.js` | The candidate switch — see below. Loaded first in every page's `<head>` |
| `measures.js` | Measure, scorecard and pillar data, plus all rendering for the home page. The framework deliberately publishes no measure total |
| `sitemap.xml` | Search engine sitemap |
| `robots.txt` | Search engine directives |

Mirrors the Notion master copy (the working document). Version History **is** public at `version-history.html`; the remaining internal/archival Notion pages (archive snapshots, Brand Assets) are not mirrored here.

## How it deploys

The Netlify site is connected to this GitHub repo. Push to `main` → Netlify auto-builds (static; no build command) → live in ~30 seconds.

**For local edits:** open any file, save, `git add` + commit + push. Netlify takes over.

### Custom domain
`acitythatworks.ca` is the public hostname, configured in **Netlify → Domain management → Add custom domain**. HTTPS auto-provisioned via Let's Encrypt.

## Email capture (Netlify Forms)

The subscribe box on the home page is wired to **Netlify Forms** (form name: `newsletter`).
1. **Forms → Settings & usage → Form notifications** → the address that should receive sign-ups (e.g. `info@acitythatworks.ca`).
2. Free tier: 100 submissions/month.

## Contact details baked into the site

- **Email:** info@acitythatworks.ca
- **Instagram / X / Facebook:** @CityThatWorksYYJ

All four live in `site.js` (footer) and on the home page's Endorse section. To change any of them, **edit `site.js` once** — the footer is shared across all nine pages.

> ⚠️ `info@acitythatworks.ca` requires the domain mailbox/forwarder to be set up. Until then, mail to it will bounce.

## Editing content later

- **Measures, scorecard, pillars** → `measures.js` (plain data arrays at the top; rendering below).
- **Home page criticisms Q&A** → the `FAQ` array in `measures.js`.
- **Anything else** → edit the relevant `.html` file directly. No build, no transpile — commit and push.

### One exception: `measures.js` data changes need a rebuild

Every measure, the pillar cards, the 12-Commitments table, and the home Q&A are pre-rendered into `index.html` and `measures.html` at commit time, not left for the browser to build — the site's deepest content needs to exist as real HTML for search engines, preview bots, and no-JS readers, not just for visitors running JavaScript. `measures.js` still ships and still runs (search, filtering, expand-all), but it only writes into a mount that's still empty, so nothing double-renders.

After editing anything in `measures.js` that feeds those four mounts (`MEASURES`, `PILLARS`, `SECTION_INTRO`/`SECTION_TAKEAWAY`, `COMMITMENTS`, `FAQ`), run:

```
node build/prerender.js
```

then commit the regenerated `index.html` and `measures.html` alongside your `measures.js` change. The script has no dependencies (plain Node, `require()`s `measures.js` directly) and is idempotent — running it with no data changes reports both files unchanged. If you forget this step, the site still works (the browser falls back to client-side rendering), but the content silently goes back to being invisible to anything that doesn't run JS until the next rebuild.

## The candidate switch

**The Candidate Scorecard and the Candidate Comparison Matrix are currently hidden.** They are still in the repo, still built by their build scripts, still complete — they are gated, not removed.

The gate is one boolean at the top of `flags.js`:

```js
var CANDIDATES_LIVE = false;   // false = hidden site-wide
```

`flags.js` loads synchronously in every page's `<head>`, ahead of everything else, so the decision is made before the first paint. With the switch off:

- `scorecard.html` and `comparison.html` redirect to the home page before they render
- every link to either one disappears — the header "Candidates" item, the "More" panel, the mobile drawer, the footer
- the blocks that exist only to point at them go with them: the homepage's "Where the candidates stand" section and its On-this-page entry, the two Get Involved bullets on the homepage and the summary, the FAQ's index entry. Those are marked `data-cand` in the HTML — mark a new one the same way and it is covered
- anything else still linking there keeps its words and loses its link, so a sentence in the version history never breaks mid-clause

CSS (`.cands-off` on `<html>`) hides those nodes before paint; `flags.js` then removes them from the DOM at `DOMContentLoaded`, ahead of `jumpnav.js`, so the section navigator never offers a jump to a heading that is gone.

**Netlify serves this site with pretty URLs on**, and that matters here more than anywhere else on the site: `scorecard.html` is also reachable as `/scorecard`, and every in-page `href` is rewritten to the extensionless form on the way out. Nothing in the switch compares whole URLs — both sides are reduced to a bare filename first (`flags.js`'s `stem()`), so `/comparison`, `comparison.html` and `comparison.html#profiles` are one page. Matching on the literal `.html` spelling gates the local copy and misses the deployed one entirely; that is exactly how the first version shipped a gate that tested clean locally and did nothing live. `window.ACTW.isCandidateUrl(url)` is exposed so the matching can be checked from the console against real deployed URL forms without deploying to find out.

Hiding is also keyed on `data-cand` and never on the `href`, for the same reason — the one CSS selector that would catch both URL forms, `[href*="scorecard"]`, also catches `index.html#scorecard`, which is the 12 Commitments anchor and has to stay.

### Previewing while the site stays dark

Append `?candidates=on` to any URL. That browser — and only that browser — sees the candidate pages, remembered in `localStorage`, with a badge in the corner so a preview is never mistaken for the live site. `?candidates=off` re-hides them; `?candidates=clear` drops the override and returns to whatever the master switch says.

### Turning it back on

Flip the boolean to `true`. That is the only edit the site's behaviour needs. Three static files also carry a crawler-facing copy of the same decision, which JavaScript cannot undo for a bot that does not run it — `flags.js` prints a console reminder listing them the first time you load a candidate page with the switch on:

1. delete the two `data-cand-gate` tags from the head of `scorecard.html` **and** `build/scorecard.tpl.html` (the template rebuilds the page), and the same two from `comparison.html`
2. uncomment the two `<url>` blocks in `sitemap.xml`
3. delete the two `Disallow:` lines in `robots.txt`

## Navigation

Every page uses the same canonical header nav:

> **Framework · Summary · Measures · Savings · City Hall · Scorecard · Compare · FAQ · [ENDORSE]**

(Scorecard and Compare are hidden while the candidate switch is off — see above.)

`version-history.html` is reachable from the footer and the mobile drawer rather than the header, which is already full.

Active page highlighted with a gold underline. Mobile menu groups all pages under "Detailed documents" plus the home-page anchors (Pillars, Method, etc.).

Every long page carries an **On this page** TOC plus a **sticky section navigator** — a jump select, prev/next steppers, a Top link and a reading-progress rule — that follows the reader down the page. The navigator is `jumpnav.js` and its styles live in `styles.css`; a page opts in with markup alone and the option list is derived from its own headings, so it cannot drift from the document.

`measures.html` carries its own sticky filter bar (search, pillar pills, expand-all) instead of the jump navigator — the pillar pills already reach the same six destinations a jump select would, so the two were never shown at once. A pillar card on the home page links in pre-filtered as `measures.html?pillar=liveable`.

Every measure is individually addressable — `measures.html#m48` opens that measure expanded and highlighted. A bookmarked or shared `#m48` on the home page (from before Every Measure moved to its own page) redirects there automatically.

## Notes

- Pure static HTML/CSS/JS. The only external resource is Google Fonts.
- Works fully on desktop and mobile: sticky top nav (hamburger below 1024px), the sticky section navigator on every long page, touch-friendly filter chips, and a scorecard whose candidate column stays pinned while the grades scroll sideways.
- Charts are hand-authored CSS bars and one inline SVG — no chart library, and every figure renders with JavaScript disabled. Every charted number traces to a figure published in the prose; nothing is derived or projected.
- Print stylesheet hides chrome, expands every `<details>`, and uses printer-safe borders. Try **⌘P** on any page.
- iOS safe-area insets respected.
- `sitemap.xml` + `robots.txt` included for SEO.
