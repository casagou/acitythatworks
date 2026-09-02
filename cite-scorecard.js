/* Overlay Notion-card citations on the 55-topic scorecard grid.
   Does not change Decision 14 letters or the n printed next to them.
   A filled cell tap jumps to that citation on the profile. */
(function () {
  if (!document.getElementById("cite-jump-css")) {
    var st = document.createElement("style");
    st.id = "cite-jump-css";
    st.textContent = "td.gc.cite-jump{cursor:pointer;color:#fff;background:var(--navy);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600}td.gc.cite-jump:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}";
    document.head.appendChild(st);
  }

  function norm(m) {
    return String(m || "")
      .replace(/–/g, "-")
      .replace(/\s+/g, "")
      .replace(/M66b\/c/i, "M66b/M66c")
      .replace(/M45b\/c/i, "M45b/M45c")
      .toLowerCase();
  }

  function apply(idx) {
    if (!idx || !idx.slugs) return;
    var keys = [];
    var head = document.querySelector("table.mg thead tr");
    if (head) {
      var ab = head.querySelectorAll("th.gh abbr");
      for (var i = 0; i < ab.length; i++) keys.push(ab[i].textContent.trim());
    }
    if (!keys.length && idx.keys) keys = idx.keys;

    var rows = document.querySelectorAll("table.mg tbody tr");
    for (var r = 0; r < rows.length; r++) {
      var gm = rows[r].querySelector(".gm");
      if (!gm) continue;
      var measure = norm(gm.textContent);
      var cells = rows[r].querySelectorAll("td.gc");
      for (var c = 0; c < cells.length && c < keys.length; c++) {
        var key = keys[c];
        var slug = idx.slugs[key];
        var byM = idx.byMeasure && idx.byMeasure[measure];
        var hit = byM && byM[key];
        if (!hit || !slug) continue;
        if (hit.kind !== "scored" && hit.kind !== "record") continue;
        var td = cells[c];
        td.classList.remove("gx");
        td.classList.add("cite-jump");
        td.setAttribute("data-cite", "/profiles/" + slug + "#c" + hit.n);
        td.setAttribute("title", (hit.mark || "Record") + " — open the citation on " + slug);
        td.setAttribute("tabindex", "0");
        td.setAttribute("role", "link");
        td.textContent = hit.mark === "Partial+" ? "P+" : (hit.mark === "Record" ? "R" : (hit.mark ? hit.mark.charAt(0) : "·"));
      }
    }
  }

  function go(td) {
    var href = td && td.getAttribute("data-cite");
    if (href) location.href = href;
  }
  document.addEventListener("click", function (e) {
    var td = e.target.closest && e.target.closest("td.gc.cite-jump");
    if (td) {
      e.preventDefault();
      e.stopPropagation();
      go(td);
    }
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var td = e.target.closest && e.target.closest("td.gc.cite-jump");
    if (td) {
      e.preventDefault();
      go(td);
    }
  });

  var inline = document.getElementById("cite-index");
  if (inline) {
    try { apply(JSON.parse(inline.textContent)); } catch (e) { /* leave dots */ }
    return;
  }
  fetch("/cite-index.json", { cache: "no-cache" }).then(function (r) {
    return r.ok ? r.json() : null;
  }).then(apply).catch(function () { /* leave dots */ });
})();
