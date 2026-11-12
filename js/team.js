/* Askıda prototype: team panel.
   Notes and suggestions are stored as GitHub Issues in the project repo, so the whole
   team sees the same list and Claude can read and close suggestions later.
   Reading uses the public GitHub API (no login). Writing opens GitHub's "new issue"
   page with the text filled in; the teammate presses Create there. */
(function () {
  "use strict";
  const A = window.ASKIDA, ART = window.ART;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, c) => ART.icon(n, c);
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage off */ } },
  };
  const SCREENS = A.SCREENS, IDS = SCREENS.map((s) => s.id);
  const screenOf = (id) => SCREENS.find((s) => s.id === id);
  const num = (id) => String(IDS.indexOf(id) + 1).padStart(2, "0");
  const REPO_URL = "https://github.com/" + A.REPO;
  const API = "https://api.github.com/repos/" + A.REPO + "/issues?state=all&per_page=100&sort=created&direction=desc";
  const K = { cache: "askida-team-cache-v1", pend: "askida-team-pending-v1", draft: "askida-team-drafts-v1", tab: "askida-team-tab-v1" };

  const cache = LS.get(K.cache) || {};
  let issues = cache.items || [], fetchedAt = cache.at || 0, status = issues.length ? "saved" : "", busy = false, lastTry = 0;
  let pending = (LS.get(K.pend) || []).filter((p) => Date.now() - p.at < 20 * 60 * 1000);
  let drafts = LS.get(K.draft) || {};
  let tab = LS.get(K.tab) || "notes", filter = "screen", screen = "welcome";
  const pnBody = $("#pnBody");

  /* ---------- GitHub ---------- */
  function parse(i) {
    if (i.pull_request) return null;
    const m = (i.title || "").match(/^\s*\[(note|suggestion)\]\s*([a-z0-9-]+)?\s*:?\s*(.*)$/i);
    const labels = (i.labels || []).map((l) => String(l.name || l).toLowerCase());
    const kind = m ? m[1].toLowerCase() : labels.indexOf("note") > -1 ? "note" : "suggestion";
    const scr = m && m[2] && IDS.indexOf(m[2].toLowerCase()) > -1 ? m[2].toLowerCase() : "general";
    const raw = String(i.body || "");
    const parts = raw.split(/\r?\n-{3,}\r?\n/);
    const text = (m ? parts[0] : raw).trim() || (m ? m[3] : i.title);
    const tm = raw.match(/^Type:\s*(.+)$/m);
    return { n: i.number, kind: kind, screen: scr, text: text, type: tm ? tm[1].trim() : "", user: i.user ? i.user.login : "someone", avatar: i.user ? i.user.avatar_url : "", url: i.html_url, open: i.state === "open", at: i.created_at, comments: i.comments || 0 };
  }
  async function load(force) {
    if (busy) return;
    if (!force && Date.now() - lastTry < 15000) return;
    busy = true; lastTry = Date.now(); renderSync("loading");
    try {
      const res = await fetch(API, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
      if (res.status === 403 || res.status === 429) {
        const reset = Number(res.headers.get("x-ratelimit-reset")) * 1000;
        const mins = reset ? Math.max(1, Math.ceil((reset - Date.now()) / 60000)) : 0;
        throw new Error("GitHub's hourly limit for this network was reached" + (mins ? ". Try again in " + mins + " min" : "") + ".");
      }
      if (res.status === 404) throw new Error("Can't read issues. Check that the repo is public and Issues are turned on.");
      if (!res.ok) throw new Error("GitHub answered with an error (" + res.status + ").");
      const data = await res.json();
      issues = data.map(parse).filter(Boolean);
      fetchedAt = Date.now(); status = "ok";
      LS.set(K.cache, { items: issues, at: fetchedAt });
      const norm = (s) => s.replace(/\s+/g, " ").trim().slice(0, 40).toLowerCase();
      pending = pending.filter((p) => !issues.some((i) => norm(i.text) === norm(p.text)));
      LS.set(K.pend, pending);
    } catch (e) {
      const known = e && e.message && (e.message.indexOf("GitHub") === 0 || e.message.indexOf("Can't") === 0);
      status = known ? e.message : "Couldn't reach GitHub. Showing the last saved copy.";
    }
    busy = false; render();
  }
  function openIssue(kind, scr, text, type) {
    const s = screenOf(scr);
    const one = text.replace(/\s+/g, " ").trim();
    const title = "[" + (kind === "note" ? "Note" : "Suggestion") + "] " + scr + ": " + (one.length > 64 ? one.slice(0, 63) + "…" : one);
    const body = text.trim() + "\n\n---\nScreen: " + (s ? num(scr) + ". " + s.title : "General") + " (" + scr + ")\n" + (type ? "Type: " + type + "\n" : "") + "Sent from the Askıda prototype";
    const url = REPO_URL + "/issues/new?title=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body) + "&labels=" + encodeURIComponent(kind);
    const w = window.open(url, "_blank", "noopener");
    pending.unshift({ kind: kind, screen: scr, text: text.trim(), type: type, at: Date.now() });
    LS.set(K.pend, pending);
    return w !== undefined;
  }

  /* ---------- Rendering ---------- */
  const ago = (iso) => {
    const s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (s < 60) return "just now"; if (s < 3600) return Math.floor(s / 60) + " min ago"; if (s < 86400) return Math.floor(s / 3600) + " h ago";
    const d = Math.floor(s / 86400); return d < 30 ? d + " d ago" : new Date(iso).toLocaleDateString();
  };
  function entry(i, showScreen) {
    const sc = screenOf(i.screen);
    const stateChip = i.kind === "suggestion" ? (i.open ? '<span class="st-chip open">Open</span>' : '<span class="st-chip done">' + ic("check") + "Applied</span>") : "";
    return '<article class="tn' + (i.open ? "" : " closed") + '"><header>' +
      (i.avatar ? '<img class="tn-av" src="' + esc(i.avatar) + '&s=48" alt="" loading="lazy" width="22" height="22">' : '<span class="tn-av"></span>') +
      "<b>@" + esc(i.user) + '</b><span class="tn-t">' + ago(i.at) + "</span>" + stateChip +
      '<a class="tn-link" href="' + esc(i.url) + '" target="_blank" rel="noopener" aria-label="Open #' + i.n + ' on GitHub">#' + i.n + "</a></header>" +
      (showScreen || i.type ? '<div class="tn-tags">' + (showScreen ? '<span class="tag">' + (sc ? num(i.screen) + " · " + esc(sc.title) : "General") + "</span>" : "") + (i.type ? '<span class="tag">' + esc(i.type) + "</span>" : "") + "</div>" : "") +
      '<p class="tn-x">' + esc(i.text) + "</p>" + (i.comments ? '<span class="tn-c">' + ic("msg") + i.comments + " comment" + (i.comments > 1 ? "s" : "") + "</span>" : "") + "</article>";
  }
  function pendingEntry(p, showScreen) {
    const sc = screenOf(p.screen);
    return '<article class="tn pending"><header><span class="tn-av"></span><b>You</b><span class="tn-t">Waiting for GitHub…</span></header>' + (showScreen ? '<div class="tn-tags"><span class="tag">' + (sc ? num(p.screen) + " · " + esc(sc.title) : "General") + "</span></div>" : "") + '<p class="tn-x">' + esc(p.text) + '</p><p class="tn-hint">Did you press <b>Create</b> on GitHub? New issues can take up to a minute to show here.</p></article>';
  }
  function syncLine() {
    let t;
    if (busy) t = "Loading from GitHub…";
    else if (status === "ok") t = "Synced with GitHub · " + ago(new Date(fetchedAt).toISOString());
    else if (status === "saved") t = "Saved copy from " + ago(new Date(fetchedAt).toISOString());
    else if (status) t = status;
    else t = "Not loaded yet";
    return '<div class="sync' + (status && status !== "ok" && status !== "saved" && !busy ? " warn" : "") + '"><span>' + esc(t) + '</span><button type="button" data-team="refresh"' + (busy ? " disabled" : "") + ">" + ic("refresh") + "Refresh</button></div>";
  }
  function renderSync() { const s = $(".sync", pnBody); if (s) s.outerHTML = syncLine(); }

  function render() {
    const s = screenOf(screen) || SCREENS[0];
    const notes = issues.filter((i) => i.kind === "note" && i.screen === screen);
    const pn = pending.filter((p) => p.kind === "note" && p.screen === screen);
    const allSugg = issues.filter((i) => i.kind === "suggestion");
    const openSugg = allSugg.filter((i) => i.open).length;
    $("#cntN").textContent = notes.length ? String(notes.length) : "";
    $("#cntS").textContent = openSugg ? String(openSugg) : "";
    $$("[data-pt]").forEach((b) => { const on = b.dataset.pt === tab; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });

    let h = "";
    if (tab === "notes") {
      h = '<section class="brief"><span class="eyebrow">Screen ' + num(s.id) + " of " + SCREENS.length + " · " + esc(A.GROUPS[s.group]) + "</span>" +
        "<h2>" + esc(s.title) + '</h2><p class="brief-sub">' + esc(s.sub) + "</p>" +
        "<h4>What it shows</h4><p>" + esc(s.what) + "</p><h4>Why it matters</h4><p>" + esc(s.why) + "</p>" +
        '<h4>Try it</h4><ul class="try">' + s.try.map((t) => "<li>" + ic("pointer") + "<span>" + esc(t) + "</span></li>").join("") + "</ul></section>" +
        '<section class="team"><div class="team-h"><h3>Team notes</h3><span class="mut">' + notes.length + " on this screen</span></div>" +
        (pn.map((p) => pendingEntry(p)).join("") + notes.map((i) => entry(i)).join("") || '<p class="empty-n">No team notes for this screen yet. Add a talking point below so whoever presents this screen knows what to say.</p>') +
        syncLine() +
        '<form class="composer" data-kind="note"><label class="c-l" for="noteText">Add a note for “' + esc(s.title) + '”</label>' +
        '<textarea id="noteText" rows="3" placeholder="A talking point, explanation or reminder for this screen…">' + esc(drafts["note:" + screen] || "") + "</textarea>" +
        '<button class="pbtn" type="submit">Post note ' + ic("ext") + "</button>" +
        '<p class="c-hint">Opens GitHub with your note filled in. Press <b>Create</b> there and it appears here for the whole team. You need a GitHub account.</p></form></section>';
    } else if (tab === "sugg") {
      const list = (filter === "screen" ? allSugg.filter((i) => i.screen === screen) : allSugg).sort((a, b) => (a.open === b.open ? 0 : a.open ? -1 : 1));
      const pl = pending.filter((p) => p.kind === "suggestion" && (filter === "all" || p.screen === screen));
      const target = drafts["sgScreen"] || screen;
      h = '<section class="team"><div class="team-h"><h3>Suggestions</h3><div class="mini-seg"><button type="button" data-team="f-screen" class="' + (filter === "screen" ? "on" : "") + '">This screen</button><button type="button" data-team="f-all" class="' + (filter === "all" ? "on" : "") + '">All (' + allSugg.length + ")</button></div></div>" +
        '<p class="mut small">' + openSugg + " open · " + (allSugg.length - openSugg) + " applied</p>" +
        (pl.map((p) => pendingEntry(p, filter === "all")).join("") + list.map((i) => entry(i, filter === "all")).join("") || '<p class="empty-n">' + (filter === "screen" ? "No suggestions for " + esc(s.title) + " yet." : "No suggestions yet.") + " Write one below.</p>") +
        syncLine() +
        '<form class="composer" data-kind="suggestion"><span class="c-l">New suggestion</span><div class="c-two">' +
        '<label>Screen<select id="sgScreen"><option value="general"' + (target === "general" ? " selected" : "") + ">General / whole app</option>" + SCREENS.map((x) => '<option value="' + x.id + '"' + (x.id === (drafts["sgScreen"] ? target : screen) ? " selected" : "") + ">" + num(x.id) + ". " + esc(x.title) + "</option>").join("") + "</select></label>" +
        '<label>Type<select id="sgType">' + ["Change", "New feature", "Bug", "Wording", "Design"].map((t) => "<option" + (drafts.sgType === t ? " selected" : "") + ">" + t + "</option>").join("") + "</select></label></div>" +
        '<textarea id="sgText" rows="4" placeholder="What should change? Example: Make the Request button say “Ask for this item”.">' + esc(drafts["sugg"] || "") + "</textarea>" +
        '<button class="pbtn" type="submit">Send suggestion ' + ic("ext") + "</button>" +
        '<p class="c-hint">Saved as a GitHub Issue in <a href="' + REPO_URL + '/issues" target="_blank" rel="noopener">' + esc(A.REPO) + "</a>. When you ask Claude to apply the suggestions, it reads the open ones, updates the prototype and closes each one, so it shows here as Applied.</p></form></section>";
    } else {
      const src = $(".nav .screen-nav");
      h = '<section class="team"><div class="team-h"><h3>All screens</h3></div><div class="screen-nav in-panel">' + (src ? src.innerHTML : "") + "</div></section>";
    }
    const keepScroll = pnBody.scrollTop;
    pnBody.innerHTML = h;
    pnBody.scrollTop = keepScroll;
    $$("[data-jump]", pnBody).forEach((b) => b.classList.toggle("on", b.dataset.jump === screen));
  }

  /* ---------- Events ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-pt]");
    if (t) { tab = t.dataset.pt; LS.set(K.tab, tab); pnBody.scrollTop = 0; render(); return; }
    const b = e.target.closest("[data-team]");
    if (!b) return;
    const k = b.dataset.team;
    if (k === "refresh") load(true);
    if (k === "f-screen" || k === "f-all") { filter = k === "f-all" ? "all" : "screen"; render(); }
  });
  pnBody.addEventListener("input", (e) => {
    const id = e.target.id;
    if (id === "noteText") drafts["note:" + screen] = e.target.value;
    else if (id === "sgText") drafts.sugg = e.target.value;
    else return;
    LS.set(K.draft, drafts);
  });
  pnBody.addEventListener("change", (e) => {
    if (e.target.id === "sgScreen") drafts.sgScreen = e.target.value;
    if (e.target.id === "sgType") drafts.sgType = e.target.value;
    LS.set(K.draft, drafts);
  });
  pnBody.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, kind = f.dataset.kind;
    const ta = $("textarea", f), text = ta.value.trim();
    if (!text) { ta.focus(); ta.classList.add("shake"); setTimeout(() => ta.classList.remove("shake"), 500); return; }
    if (kind === "note") { openIssue("note", screen, text, ""); delete drafts["note:" + screen]; }
    else { openIssue("suggestion", $("#sgScreen").value, text, $("#sgType").value); delete drafts.sugg; delete drafts.sgScreen; }
    LS.set(K.draft, drafts);
    render();
  });
  window.addEventListener("proto:screen", (e) => {
    if (e.detail.id === screen) return;
    screen = e.detail.id;
    if (tab !== "sugg" || filter === "screen") pnBody.scrollTop = 0;
    render();
  });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) load(false); });
  window.addEventListener("focus", () => load(false));

  if (window.Proto && window.Proto.current()) screen = window.Proto.current();
  render();
  load(true);
})();
