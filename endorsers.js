/* A City That Works — Public Endorsement Registry
   ---------------------------------------------------------------------------
   Sections 5 and 6 of the Endorsement Pack promise that every endorsement is
   published here within 5 business days of being received. This file is that
   registry.

   IMPORTANT: this list ships EMPTY on purpose. Nothing in it is illustrative or
   placeholder. Only add an entry once you hold a signed endorsement form from
   that person or organization — a registry with invented names would destroy
   the credibility the rest of the framework is built on.

   Add one object per endorsement:

     {
       name:   "Full name",              // required — person, or org contact
       org:    "Organization name",      // required for type "organization"
       type:   "candidate",              // "candidate" | "organization" | "resident"
       office: "Mayor",                  // candidates only: "Mayor" | "Councillor"
       tier:   1,                        // 1 = full framework, 2 = pillar-level, 3 = specific measures
       scope:  "Full framework",         // e.g. "Pillars: Safe, Well-Managed" or "M6, M7, M15"
       date:   "2026-08-14",             // ISO date the endorsement was published
       url:    "https://example.ca",     // optional — campaign or organization site
       note:   "",                       // optional — flagged modifications
       withdrawn: "2026-09-02"           // optional — set if withdrawn; kept public per Section 5
     }
*/
const ENDORSERS = [];

const TIER_LABEL = {
  1: 'Tier 1 · Full framework',
  2: 'Tier 2 · Pillar-level',
  3: 'Tier 3 · Specific measures'
};

const REG_GROUPS = [
  { key: 'candidate',    label: 'Candidates',    blurb: 'Running for Mayor or Council, October 17, 2026.' },
  { key: 'organization', label: 'Organizations', blurb: 'Community associations, business groups, and civic organizations.' },
  { key: 'resident',     label: 'Residents',     blurb: 'Victoria residents who have publicly backed the framework.' }
];

function regEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Only http(s) and mailto links are emitted, so a bad paste into `url` can't
   become a javascript: or data: href. */
function regUrl(u) {
  var s = String(u == null ? '' : u).trim();
  return /^(https?:\/\/|mailto:)/i.test(s) ? s : '';
}

function regDate(iso) {
  var parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!parts) return regEsc(iso);
  var months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
  return months[+parts[2] - 1] + ' ' + (+parts[3]) + ', ' + parts[1];
}

function renderRegistry() {
  var mount = document.getElementById('registry-mount');
  if (!mount) return;

  var live = ENDORSERS.filter(function (e) { return !e.withdrawn; });
  var h = '<section class="reg" id="registry" aria-labelledby="reg-title">' +
          '<div class="reg-hd">' +
          '<div class="reg-eyb">◆ Public Registry</div>' +
          '<h2 class="reg-t" id="reg-title">Who has endorsed</h2>' +
          '</div>';

  if (!ENDORSERS.length) {
    /* Honest empty state — an empty registry is a fact, not a failure. */
    h += '<div class="reg-empty">' +
         '<p class="reg-empty-l">No public endorsements yet.</p>' +
         '<p>This registry is published openly and updated within five business days of each ' +
         'endorsement being received. It is empty because the framework is new — not because ' +
         'endorsements are being withheld from it.</p>' +
         '<p><strong>Candidates:</strong> the tiers, suggested language, and the form are below. ' +
         '<strong>Residents and organizations:</strong> write to ' +
         '<a href="mailto:info@acitythatworks.ca">info@acitythatworks.ca</a>.</p>' +
         '<a href="#sec-3" class="bn bnp">See the three tiers →</a>' +
         '</div></section>';
    mount.outerHTML = h;
    return;
  }

  h += '<p class="reg-count"><strong>' + live.length + '</strong> public endorsement' +
       (live.length === 1 ? '' : 's') + ' on the record.</p>';

  REG_GROUPS.forEach(function (g) {
    var items = ENDORSERS.filter(function (e) { return e.type === g.key; });
    if (!items.length) return;
    h += '<div class="reg-grp"><h3 class="reg-gh">' + regEsc(g.label) +
         ' <span class="reg-gn">' + items.length + '</span></h3>' +
         '<p class="reg-gb">' + regEsc(g.blurb) + '</p><ul class="reg-list">';
    items.forEach(function (e) {
      var title = e.type === 'organization' ? (e.org || e.name) : e.name;
      var href = regUrl(e.url);
      var sub = [];
      if (e.office) sub.push(regEsc(e.office));
      if (e.type === 'organization' && e.org && e.name) sub.push(regEsc(e.name));
      h += '<li class="reg-i' + (e.withdrawn ? ' reg-w' : '') + '">' +
           '<div class="reg-n">' +
           (href ? '<a href="' + regEsc(href) + '" target="_blank" rel="noopener">' + regEsc(title) + '</a>'
                 : regEsc(title)) +
           (sub.length ? ' <span class="reg-sub">' + sub.join(' · ') + '</span>' : '') +
           '</div>' +
           (e.tier ? '<div class="reg-tier">' + regEsc(TIER_LABEL[e.tier] || ('Tier ' + e.tier)) + '</div>' : '') +
           (e.scope ? '<div class="reg-scope">' + regEsc(e.scope) + '</div>' : '') +
           '<div class="reg-meta">Published ' + regDate(e.date) +
           (e.withdrawn ? ' · <strong>Withdrawn ' + regDate(e.withdrawn) + '</strong>' : '') + '</div>' +
           (e.note ? '<div class="reg-note">' + regEsc(e.note) + '</div>' : '') +
           '</li>';
    });
    h += '</ul></div>';
  });

  h += '<p class="reg-foot">Withdrawals remain listed, per Section 5 of this pack. ' +
       'To add or correct an entry, write to <a href="mailto:info@acitythatworks.ca">' +
       'info@acitythatworks.ca</a>.</p></section>';
  mount.outerHTML = h;
}

document.addEventListener('DOMContentLoaded', renderRegistry);
