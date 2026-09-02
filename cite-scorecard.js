/* Overlay Notion-card citations on the scorecard.
   Does not change overall letters or the n printed next to them.
   A filled cell tap jumps to that citation on the profile
   (same-page panel if the reader is already there). */
(function () {
  if (!document.getElementById("cite-jump-css")) {
    var st = document.createElement("style");
    st.id = "cite-jump-css";
    st.textContent =
      "td.gc.cite-jump,td.cc.cite-jump{cursor:pointer}" +
      "td.gc.cite-jump:focus-visible,td.cc.cite-jump:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}";
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

  function applyGrid(idx) {
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
        if (td.getAttribute("data-cite")) continue;
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
    if (!href) return;
    var here = location.pathname.replace(/\/$/, "");
    var dest = href.split("#")[0].replace(/\/$/, "");
    var hash = href.indexOf("#") >= 0 ? href.slice(href.indexOf("#")) : "";
    if (here === dest || here === dest + ".html") {
      if (hash) {
        if (location.hash === hash) {
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        } else {
          location.hash = hash;
        }
      }
      return;
    }
    location.href = href;
  }

  document.addEventListener("click", function (e) {
    var td = e.target.closest && e.target.closest("[data-cite]");
    if (!td) return;
    e.preventDefault();
    e.stopPropagation();
    go(td);
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    var td = e.target.closest && e.target.closest("[data-cite]");
    if (!td) return;
    e.preventDefault();
    go(td);
  });

  var inline = document.getElementById("cite-index");
  if (inline) {
    try { applyGrid(JSON.parse(inline.textContent)); } catch (e) { /* baked cells stay */ }
    return;
  }
  fetch("/cite-index.json", { cache: "no-cache" }).then(function (r) {
    return r.ok ? r.json() : null;
  }).then(applyGrid).catch(function () { /* baked cells stay */ });
})();
