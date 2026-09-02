/* A City That Works — the drawn icon set (v2.3)
   ------------------------------------------------
   Line icons for the six pillars and the five candidate "doors", replacing
   the emoji that rendered differently on every platform and sat awkwardly
   beside a serif. Navy strokes, round caps, a 24-unit grid; colour comes
   from currentColor so the same path works on paper, on a tint and on the
   night band.

   One file, two consumers: the browser reads the global (measures.js,
   civic.js, the scorecard), and the build scripts require() it, so the
   pre-rendered HTML and the client-rendered HTML carry the same drawing. */
(function (root) {
  var A = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  var ICONS = {
    /* pillars */
    foundation: '<svg class="picon" ' + A + '><path d="M4 20c6-1 12-6 15-15"/><path d="M8.5 15.5C7 13 7 9.5 9 7.5c2.5 1 3.5 4 2.5 7"/><path d="M13.5 10.5c-.5-2.5.5-5 2.5-6 1.5 2 1.5 4.5 0 6.5"/></svg>',
    liveable:   '<svg class="picon" ' + A + '><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M10 20v-6h4v6"/></svg>',
    safe:       '<svg class="picon" ' + A + '><path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6L12 3z"/><path d="m9 12 2 2 4-4"/></svg>',
    beautiful:  '<svg class="picon" ' + A + '><path d="M12 21v-6"/><path d="M8 15h8"/><path d="M12 15c-4 0-6.5-2.5-6.5-5.5S8 4 12 3c4 1 6.5 3.5 6.5 6.5S16 15 12 15z"/><path d="M12 8v7"/></svg>',
    managed:    '<svg class="picon" ' + A + '><ellipse cx="12" cy="6.5" rx="7" ry="2.5"/><path d="M5 6.5v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4"/><path d="M5 10.5v4c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-4"/><path d="M5 14.5v3c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-3"/></svg>',
    democratic: '<svg class="picon" ' + A + '><path d="M4 12h16v8H4z"/><path d="M9 12V7.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V12"/><path d="M8 12h8"/><path d="m10.5 9.5 1 1 2.5-2.5"/></svg>',
    /* candidate doors */
    m66:     '<svg class="picon" ' + A + '><circle cx="12" cy="12" r="9"/><path d="m8.5 15.5 7-7"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/></svg>',
    m2627:   '<svg class="picon" ' + A + '><path d="M3 21h18"/><path d="M5 21V8l5-3v16"/><path d="M10 21V11l6-3v13"/><path d="M16 21v-8l3-1v9"/></svg>',
    m6:      '<svg class="picon" ' + A + '><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9 20v-5h6v5"/></svg>',
    m66d:    '<svg class="picon" ' + A + '><path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>',
    program: '<svg class="picon" ' + A + '><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>',
    /* utilities */
    star:    '<svg class="picon" ' + A + '><path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z"/></svg>',
    map:     '<svg class="picon" ' + A + '><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>',
    compare: '<svg class="picon" ' + A + '><path d="M4 5h7v14H4z"/><path d="M13 5h7v14h-7z"/><path d="M7.5 9v6"/><path d="M16.5 9v6"/></svg>',
    ask:     '<svg class="picon" ' + A + '><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8"/><path d="M8 12.5h5"/></svg>',
    bill:    '<svg class="picon" ' + A + '><path d="M5 4h14v16l-2.3-1.5L14.3 20 12 18.5 9.7 20 7.3 18.5 5 20z"/><path d="M9 9h6"/><path d="M9 13h6"/></svg>',
    /* the record mark: a documented term-in-office fact, never a grade */
    record:  '<svg class="picon" ' + A + '><path d="M9 3.5h6v3H9z"/><path d="M6.5 6h11v14.5h-11z"/><path d="M9.5 12h5"/><path d="M9.5 15.5h3.5"/></svg>',
    scales:  '<svg class="picon" ' + A + '><path d="M12 3.5v17"/><path d="M5 7h14"/><path d="m5 7-3 7h6z"/><path d="m19 7-3 7h6z"/><path d="M8.5 20.5h7"/></svg>',
    pledge:  '<svg class="picon" ' + A + '><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="m9 14 2 2 4-4"/></svg>',
    history: '<svg class="picon" ' + A + '><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    chart:   '<svg class="picon" ' + A + '><path d="M4 20V10"/><path d="M10 20V4.5"/><path d="M16 20v-7"/><path d="M2 20h20"/></svg>'
  };
  root.ACTW_ICONS = ICONS;
  if (typeof module !== 'undefined' && module.exports) module.exports = ICONS;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
