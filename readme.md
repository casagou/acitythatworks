# A City That Works — Website (v1.3)

A complete, multi-page static website for the citizens' framework. No build step, no dependencies. Lives at **[acitythatworks.ca](https://acitythatworks.ca)**, auto-deployed from this repo via Netlify on every push to `main`.

## What's in this folder

| File | What it is |
|------|------------|
| `index.html` | Home — hero, five pillars, method, **all ~101 measures** (filterable + searchable, full text inline), 12-commitment scorecard, balance sheet, principles, criticisms Q&A, subscribe/endorse |
| `summary.html` | One-Page Summary — the 60-second version (problem → pillars → flagship measures → math → method) |
| `savings.html` | Savings & Revenue Analysis — the full math, every table, with sources and honest caveats |
| `city-hall.html` | How City Hall Actually Works — plain-language guide to municipal power |
| `endorse.html` | Candidate Endorsement Pack — three tiers, campaign language, full measure checklist, endorsement form |
| `comparison.html` | Candidate Comparison Matrix — every 2026 candidate scored against the framework |
| `faq.html` | Frequently Asked Questions — the full skeptic's Q&A |
| `styles.css` | Shared stylesheet for every page (includes print rules) |
| `site.js` | Shared footer (contact + social) and mobile-menu logic, injected on every page |
| `measures.js` | The 100 measures + scorecard + pillar data and all rendering for the home page |
| `sitemap.xml` | Search engine sitemap |
| `robots.txt` | Search engine directives |

Mirrors the Notion master copy (the working document); the internal/archival pages in Notion (Version History, v1.1/v1.2 archive snapshots, Brand Assets) are not public-facing and are intentionally not mirrored here.

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

All four live in `site.js` (footer) and on the home page's Endorse section. To change any of them, **edit `site.js` once** — the footer is shared across all seven pages.

> ⚠️ `info@acitythatworks.ca` requires the domain mailbox/forwarder to be set up. Until then, mail to it will bounce.

## Editing content later

- **Measures, scorecard, pillars** → `measures.js` (plain data arrays at the top; rendering below).
- **Home page criticisms Q&A** → the `FAQ` array in `measures.js`.
- **Anything else** → edit the relevant `.html` file directly. No build, no transpile — commit and push.

## Navigation

Every page uses the same canonical header nav:

> **Framework · Summary · Measures · Savings · City Hall · Compare · FAQ · [ENDORSE]**

Active page highlighted with a gold underline. Mobile menu groups all pages under "Detailed documents" plus the home-page anchors (Pillars, Method, etc.).

All long pages (Savings, City Hall, Endorse, FAQ, Comparison) have an in-page **On this page** TOC right after the hero, plus a breadcrumb back to the framework.

## Notes

- Pure static HTML/CSS/JS. The only external resource is Google Fonts.
- Works fully on desktop and mobile: sticky top nav (8 items at 1100px+, hamburger below), a floating "Jump to…" drawer on the home page, touch-friendly filter chips, and a scorecard that switches from a table to cards on small screens.
- Print stylesheet hides chrome, expands every `<details>`, and uses printer-safe borders. Try **⌘P** on any page.
- iOS safe-area insets respected.
- `sitemap.xml` + `robots.txt` included for SEO.
