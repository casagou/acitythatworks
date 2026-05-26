# A City That Works — Website

A static, single-file website for the **A City That Works** citizens' framework for Victoria 2026.

---

## Deploy to Netlify (drag & drop)

This is designed for the fastest possible deployment — no build step, no configuration.

### Steps

1. **Compress this folder into a `.zip`** (or just drag the unzipped folder directly).
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**.
3. **Drag the folder (or the .zip)** onto the drop zone.
4. Netlify will assign a random subdomain like `friendly-tarsier-abc123.netlify.app`. The site is live immediately.
5. In the Netlify dashboard, you can:
   - **Rename the subdomain** (Site settings → Domain management → Options → Edit site name) — e.g., to `acitythatworks`
   - **Connect your custom domain** when you register `acitythatworks.ca` (Domain management → Add custom domain)

That's it. No git, no CI, no build commands.

---

## What's included

- `index.html` — the complete site, single file, ~2,000 lines. Includes:
  - Hero + diagnostic stats
  - Five Pillars + Foundation
  - By-audience callouts
  - The Method (6 steps)
  - Separation of Powers
  - All 82 measures, grouped by pillar and sub-section
  - 12 Commitments scorecard
  - Balance Sheet + Tax Glide Path
  - What we are / what we aren't
  - 7-item FAQ
  - Adopt section with Netlify email form
  - Footer with contact

### External dependencies (all CDN-loaded, no install)

- **Tailwind CSS** (Play CDN) — utility classes
- **Google Fonts** — Fraunces (display), Public Sans (body), JetBrains Mono (numerics)
- **Inline SVG icons** — no icon library dependency

### Built-in features

- ✅ **Fully responsive** — mobile, tablet, desktop
- ✅ **Smooth-scroll anchor navigation** with sticky header
- ✅ **Mobile hamburger menu**
- ✅ **FAQ accordion** (native `<details>`/`<summary>`, no JS framework)
- ✅ **Print-friendly** styles
- ✅ **Open Graph + Twitter Card** meta tags for social sharing
- ✅ **Favicon** (inline SVG, navy + gold diamond)
- ✅ **Netlify Forms** for email capture (works automatically once deployed)

---

## Email capture (Netlify Forms)

The email subscription form uses **Netlify Forms** — submissions appear automatically in your Netlify dashboard.

### After deployment:

1. Go to your Netlify site → **Forms** tab
2. You'll see a form named `newsletter`
3. Set up notifications: **Forms → Settings & usage → Form notifications** → add your email address (`capitalprojectyyj@gmail.com`)
4. (Optional) Set up Zapier/Make integration to auto-add submissions to a real mailing list (Buttondown, Mailchimp, ConvertKit, etc.) when you outgrow Netlify Forms

**Spam protection** is already enabled (honeypot field).

### Free tier limits

Netlify Forms free tier: **100 submissions/month**. Plenty for early traction. If you hit that ceiling, you're winning — and at that point you'll want a proper mailing list provider anyway.

---

## Customization

### Change the email address

Find and replace `capitalprojectyyj@gmail.com` (appears 3 times in `index.html`).

### Change colors

CSS variables at the top of the `<style>` block:

```css
--navy:  #1A3668;  /* primary */
--gold:  #D4A843;  /* accent */
--paper: #FAF7F0;  /* background */
--rust:  #B5341F;  /* diagnostic stats */
--moss:  #227247;  /* "we are" green */
--olive: #7A6B3D;  /* foundation pillar */
```

### Edit the 82 measures

Scroll to the `MEASURES` array near the bottom of the file (inside the `<script>` block). Each measure has:

```javascript
{ id: 6, pillar: 'liveable', section: 'Housing',
  title: '...', body: '...', budget: '...' }
```

Pillars: `foundation`, `liveable`, `safe`, `beautiful`, `managed`, `democratic`.

### Edit the 12 commitments

The commitments table is hardcoded HTML — search for `commitments` to find it.

### Edit the FAQ

Search for `<details class="hairline-b">` blocks — there are 7. Each is a self-contained Q&A.

---

## Custom domain (when ready)

Once you register `acitythatworks.ca`:

1. In Netlify: **Domain management → Add custom domain** → `acitythatworks.ca`
2. Update DNS at your registrar (Cloudflare, Namecheap, etc.):
   - Add a CNAME record from `acitythatworks.ca` to `your-site-name.netlify.app`
   - Or use Netlify DNS (transfer nameservers — simpler)
3. Netlify auto-provisions a Let's Encrypt SSL certificate. Done.

---

## What this site doesn't do (intentionally)

- **No analytics.** Add Plausible (`plausible.io`) or Fathom if you want privacy-respecting analytics — both are one `<script>` tag in the `<head>`.
- **No CMS.** All content is in `index.html`. Edit directly. For a small static site, this is the right call.
- **No interactive budget allocator.** That's a separate tool (see `capital-project-budget.jsx` from earlier conversation) — better to keep concerns separated.
- **No images.** The hero is text-only. If you want a hero image, add `<img>` in the hero section. Recommended: a duotone-treated photo of the Inner Harbour or Legislature, B&W or navy-tinted.

---

## Performance notes

The site is ~80KB of HTML + CDN resources. First paint should be under 1 second on any modern connection. Tailwind Play CDN adds ~3MB cached after first visit — fine for a content site at this scale.

If you want to optimize further later:
- Replace Tailwind Play CDN with a precompiled CSS file (~30KB instead of 3MB)
- Self-host fonts instead of Google Fonts
- Use Netlify's image optimization for any hero/section images

None of this is needed for launch.
