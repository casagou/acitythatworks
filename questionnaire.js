/* A City That Works — the candidate questionnaire, in the browser.
   ------------------------------------------------------------------
   The questions themselves are static HTML, written by build/questionnaire.js
   and readable with JavaScript off. This file only adds the four things a
   46-question form needs to be fillable in one sitting:

     1. Autosave. Every keystroke and click is written to localStorage under
        one key, and restored on the next visit. The PDF promises the online
        version "saves your progress as you go", so this is the promise.
     2. A progress meter, so a candidate can see how much is left.
     3. The two budget questions add themselves up as you type, because
        "your numbers have to add up to $5 million" is a rule nobody should
        have to check with a calculator.
     4. Three ways to send it back — copy, download, or open an email. There
        is no server behind this page and nothing is transmitted anywhere:
        the answers sit in the candidate's own browser until they send them
        themselves. That is stated on the page, and it has to stay true.

   Everything degrades: with JavaScript off the questions are still readable
   and printable, which is what the published-in-full promise requires. */
(function () {
  'use strict';

  var form = document.getElementById('qform');
  if (!form) return;

  var KEY = 'actw-questionnaire-2026';
  var TO = 'info@acitythatworks.ca';

  /* ── storage ───────────────────────────────────────────────────────────
     Wrapped, because a browser in private mode throws on write rather than
     failing quietly, and a thrown exception here would take the progress
     meter and the budget totals down with it. */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function store(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  function fields() {
    return form.querySelectorAll('input[name],textarea[name],select[name]');
  }

  function snapshot() {
    var d = {}, els = fields();
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'checkbox') {
        if (el.checked) { (d[el.name] = d[el.name] || []).push(el.value); }
      } else if (el.type === 'radio') {
        if (el.checked) { d[el.name] = el.value; }
      } else if (el.value) {
        d[el.name] = el.value;
      }
    }
    return d;
  }

  function restore(d) {
    var els = fields();
    for (var i = 0; i < els.length; i++) {
      var el = els[i], v = d[el.name];
      if (v === undefined) continue;
      if (el.type === 'checkbox') {
        el.checked = Object.prototype.toString.call(v) === '[object Array]'
          ? v.indexOf(el.value) > -1 : v === el.value;
      } else if (el.type === 'radio') {
        el.checked = (v === el.value);
      } else {
        el.value = v;
      }
    }
  }

  /* ── the saved indicator ───────────────────────────────────────────── */
  var savedEl = document.getElementById('q-saved');
  var saveTimer = null;

  function stamp() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
  }

  function save() {
    var ok = store(snapshot());
    if (!savedEl) return;
    savedEl.textContent = ok ? 'Saved · ' + stamp() : 'Not saved — this browser blocks storage';
    savedEl.classList.add('q-flash');
    setTimeout(function () { savedEl.classList.remove('q-flash'); }, 900);
  }

  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 400);
  }

  /* ── progress ──────────────────────────────────────────────────────── */
  var progressEl = document.getElementById('q-progress');
  var fillEl = document.getElementById('q-fill');
  var questions = form.querySelectorAll('.q-q');

  function isAnswered(q) {
    var els = q.querySelectorAll('input,textarea,select');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.checked) return true; }
      else if (el.value && el.value.trim()) return true;
    }
    return false;
  }

  function updateProgress() {
    var n = 0;
    for (var i = 0; i < questions.length; i++) {
      var on = isAnswered(questions[i]);
      questions[i].classList.toggle('q-on', on);
      if (on) n++;
    }
    var total = questions.length || 1;
    if (fillEl) fillEl.style.width = Math.round((n / total) * 100) + '%';
    if (progressEl) progressEl.textContent = n + ' of ' + questions.length + ' answered';
  }

  /* ── the two budget questions ──────────────────────────────────────── */
  function digits(s) {
    var n = parseInt(String(s || '').replace(/[^0-9]/g, ''), 10);
    return isNaN(n) ? 0 : n;
  }
  function money(n) { return '$' + n.toLocaleString('en-CA'); }

  function updateMoney(box) {
    var inputs = box.querySelectorAll('.q-num'), sum = 0;
    for (var i = 0; i < inputs.length; i++) sum += digits(inputs[i].value);
    var target = digits(box.getAttribute('data-total'));
    var sumEl = box.querySelector('.q-msum'), diffEl = box.querySelector('.q-mdiff');
    if (sumEl) sumEl.textContent = money(sum);
    if (diffEl) {
      diffEl.textContent = sum === target ? 'adds up ✓'
        : sum < target ? money(target - sum) + ' still to allocate'
        : money(sum - target) + ' over';
    }
    box.classList.toggle('q-ok', sum === target && sum > 0);
  }

  function updateAllMoney() {
    var boxes = form.querySelectorAll('.q-money');
    for (var i = 0; i < boxes.length; i++) updateMoney(boxes[i]);
  }

  /* ── "pick up to two" ──────────────────────────────────────────────── */
  function enforceMax(group) {
    var max = parseInt(group.getAttribute('data-max'), 10);
    if (!max) return;
    var boxes = group.querySelectorAll('input[type=checkbox]'), n = 0, i;
    for (i = 0; i < boxes.length; i++) if (boxes[i].checked) n++;
    for (i = 0; i < boxes.length; i++) boxes[i].disabled = (!boxes[i].checked && n >= max);
  }

  function enforceAllMax() {
    var groups = form.querySelectorAll('.q-opts[data-max]');
    for (var i = 0; i < groups.length; i++) enforceMax(groups[i]);
  }

  /* ── what the candidate sends us ───────────────────────────────────── */
  function text(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function val(id) {
    var el = document.getElementById(id);
    return el && el.value ? el.value.trim() : '';
  }

  function partAnswer(part, out) {
    var type = part.getAttribute('data-type'), i;
    var ask = text(part.querySelector('.q-ask'));
    if (ask) out.push('  ' + ask);

    if (type === 'single' || type === 'multi') {
      var picked = part.querySelectorAll('input:checked');
      if (!picked.length) out.push('    (no answer)');
      for (i = 0; i < picked.length; i++) out.push('    • ' + picked[i].value);
      var fills = part.querySelectorAll('.q-fill');
      for (i = 0; i < fills.length; i++) {
        if (fills[i].value.trim()) out.push('      → ' + fills[i].value.trim());
      }
    } else if (type === 'grid') {
      var rows = part.querySelectorAll('.q-row');
      for (i = 0; i < rows.length; i++) {
        var hit = rows[i].querySelector('input:checked');
        out.push('    ' + text(rows[i].querySelector('.q-rt')) +
                 ' — ' + (hit ? hit.value : '(no answer)'));
      }
    } else if (type === 'money') {
      var box = part.querySelector('.q-money'), sum = 0;
      var mrows = part.querySelectorAll('.q-mrow');
      for (i = 0; i < mrows.length; i++) {
        var n = digits(mrows[i].querySelector('.q-num').value);
        sum += n;
        out.push('    ' + text(mrows[i].querySelector('label')) + ' — ' + money(n));
      }
      var extra = part.querySelector('.q-mextra textarea');
      if (extra && extra.value.trim()) {
        out.push('    ' + text(part.querySelector('.q-mextra label')) + ' — ' + extra.value.trim());
      }
      out.push('    TOTAL — ' + money(sum) +
               ' (must equal ' + money(digits(box.getAttribute('data-total'))) + ')');
    } else if (type === 'text') {
      var ta = part.querySelector('textarea');
      out.push('    ' + (ta && ta.value.trim() ? ta.value.trim() : '(no answer)'));
    }
    out.push('');
  }

  function transcript() {
    var out = [], i, j, k;
    out.push('A CITY THAT WORKS — CANDIDATE QUESTIONNAIRE');
    out.push('City of Victoria · Mayor and Council · 2026');
    out.push('Returned from acitythatworks.ca/questionnaire on ' + new Date().toLocaleString('en-CA'));
    out.push('');
    out.push('NAME:     ' + (val('d-name') || '(not given)'));
    out.push('OFFICE:   ' + (val('d-office') || '(not given)'));
    out.push('WEBSITE:  ' + (val('d-site') || '(not given)'));
    out.push('EMAIL:    ' + (val('d-email') || '(not given)'));
    out.push('PHONE:    ' + (val('d-phone') || '(not given)'));
    var consent = document.getElementById('d-consent');
    out.push('PUBLICATION UNDERSTOOD: ' + (consent && consent.checked ? 'yes' : 'not ticked'));
    out.push('');

    var blocks = form.querySelectorAll('.q-block');
    for (i = 0; i < blocks.length; i++) {
      out.push('══════════════════════════════════════════════════════════');
      out.push(text(blocks[i].querySelector('.q-bl')).toUpperCase() + ' · ' +
               text(blocks[i].querySelector('.q-bt')));
      out.push('══════════════════════════════════════════════════════════');
      out.push('');
      var qs = blocks[i].querySelectorAll('.q-q');
      for (j = 0; j < qs.length; j++) {
        out.push(qs[j].getAttribute('data-code') + ' · ' + text(qs[j].querySelector('.q-t')));
        var parts = qs[j].querySelectorAll('.q-part');
        for (k = 0; k < parts.length; k++) partAnswer(parts[k], out);
      }
    }

    out.push('──────────────────────────────────────────────────────────');
    out.push('SIGNED: ' + (val('d-sign') || '(not signed)'));
    out.push('DATE:   ' + (val('d-date') || '(no date)'));
    return out.join('\n');
  }

  /* ── sending ───────────────────────────────────────────────────────── */
  var msg = document.getElementById('q-msg');
  function say(s) {
    if (!msg) return;
    msg.textContent = s;
    setTimeout(function () { if (msg.textContent === s) msg.textContent = ''; }, 6000);
  }

  function subject() {
    var who = val('d-name') || 'Candidate';
    var office = val('d-office');
    return 'Questionnaire — ' + who + (office ? ' — ' + office : '');
  }

  var copyBtn = document.getElementById('q-copy');
  if (copyBtn) copyBtn.addEventListener('click', function () {
    var t = transcript();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      say(ok ? 'Copied. Paste it into an email to ' + TO
             : 'Could not copy — use “Download as a file” instead.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        say('Copied. Paste it into an email to ' + TO);
      }, fallback);
    } else { fallback(); }
  });

  var dlBtn = document.getElementById('q-download');
  if (dlBtn) dlBtn.addEventListener('click', function () {
    var slug = (val('d-name') || 'answers').toLowerCase().replace(/[^a-z0-9]+/g, '-')
                 .replace(/^-|-$/g, '') || 'answers';
    var blob = new Blob([transcript()], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ACTW-questionnaire-' + slug + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    say('Downloaded. Attach that file to an email to ' + TO);
  });

  /* The email button carries a short covering note, not the answers: a
     mailto: body long enough to hold 46 answers is silently truncated by
     most mail clients, and a half-sent questionnaire is worse than none. */
  var mailBtn = document.getElementById('q-email');
  function updateMail() {
    if (!mailBtn) return;
    var body = 'My answers to the A City That Works candidate questionnaire ' +
               'are pasted below / attached as a file.\n\n' +
               'Name: ' + (val('d-name') || '') + '\n' +
               'Office: ' + (val('d-office') || '') + '\n\n';
    mailBtn.href = 'mailto:' + TO +
                   '?subject=' + encodeURIComponent(subject()) +
                   '&body=' + encodeURIComponent(body);
  }

  var clearBtn = document.getElementById('q-clear');
  if (clearBtn) clearBtn.addEventListener('click', function () {
    if (!window.confirm('Clear every answer you have typed on this page? This cannot be undone.')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    form.reset();
    enforceAllMax();
    updateAllMoney();
    updateProgress();
    updateMail();
    if (savedEl) savedEl.textContent = 'Cleared';
    say('Cleared. Nothing was ever sent to us.');
  });

  /* ── wiring ────────────────────────────────────────────────────────── */
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  form.addEventListener('input', function (e) {
    if (e.target.classList && e.target.classList.contains('q-num')) {
      updateMoney(e.target.closest('.q-money'));
    }
    updateProgress();
    updateMail();
    queueSave();
  });

  form.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') {
      var group = e.target.closest('.q-opts[data-max]');
      if (group) enforceMax(group);
    }
    updateProgress();
    updateMail();
    queueSave();
  });

  /* Numbers come back grouped once the field is left, so $5,000,000 reads
     like money rather than like a phone number. */
  form.addEventListener('blur', function (e) {
    if (e.target.classList && e.target.classList.contains('q-num')) {
      var n = digits(e.target.value);
      e.target.value = n ? n.toLocaleString('en-CA') : '';
      updateMoney(e.target.closest('.q-money'));
      queueSave();
    }
  }, true);

  restore(load());
  enforceAllMax();
  updateAllMoney();
  updateProgress();
  updateMail();
})();
