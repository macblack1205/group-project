/* Askıda prototype: the app (screens, navigation, demo data) and the presenter shell. */
(function () {
  "use strict";
  const A = window.ASKIDA, ART = window.ART;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ic = (n, c) => ART.icon(n, c);
  const P = (o) => esc(JSON.stringify(o));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Dates ---------- */
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const NOW = new Date();
  const dayLabel = (off) => { const d = new Date(NOW); d.setDate(d.getDate() + off); return d.getDate() + " " + MON[d.getMonth()]; };
  const clock = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  const stamp = () => "Today, " + clock();
  const RESET = (function () { const d = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1); return { label: "1 " + MONTHS[d.getMonth()], days: Math.max(1, Math.ceil((d - NOW) / 864e5)) }; })();
  const MONTH = MONTHS[NOW.getMonth()];

  /* ---------- Storage (demo state survives reloads on this device) ---------- */
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage off */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage off */ } },
  };
  const KEY = "askida-proto-state-v1";

  function freshState() {
    return {
      loggedIn: false, guest: false, hood: "Kadıköy", privateDefault: true,
      favs: ["sweater", "lamp"],
      requests: [
        { id: "r1", item: "jacket", status: "scheduled", when: dayLabel(-3), private: true, point: A.POINTS["Caferağa"], code: "AS-4821" },
        { id: "r2", title: "Breakfast Pack", cat: "food", art: "drygoods", donor: "burak", status: "completed", when: dayLabel(-4) },
        { id: "r3", title: "Vegetable Box", cat: "food", art: "apples", donor: "selin", status: "completed", when: dayLabel(-8) },
      ],
      donations: [
        { id: "d1", title: "High-School Prep Books", cat: "books", art: "textbooks", step: 4, to: "Göztepe",
          times: [dayLabel(-10) + ", 14:20", dayLabel(-10) + ", 16:05", dayLabel(-9) + ", 10:00", dayLabel(-9) + ", 18:20"] },
      ],
      myItems: [],
      threads: [
        { id: "t1", with: "ayse", item: "jacket", unread: 1, msgs: [
          { from: "them", text: "Hi! I saw your request for the winter jacket. It's yours.", t: "Mon 14:02" },
          { from: "them", text: "Can you pick it up from the Caferağa Social Support Point on Thursday after 18:00?", t: "Mon 14:03" },
          { from: "me", text: "Yes, Thursday works for me. Thank you so much!", t: "Mon 14:10" },
          { from: "them", text: "Great, I'll leave it there with your pickup code.", t: "Mon 14:12" },
          { type: "pickup", text: "Thursday, 18:00 · Caferağa Social Support Point", code: "AS-4821" },
        ] },
        { id: "t2", with: "burak", title: "Breakfast Pack", unread: 0, msgs: [
          { from: "them", text: "The breakfast pack is at the partner point. Enjoy!", t: dayLabel(-4) },
          { from: "me", text: "Picked it up, thank you Burak!", t: dayLabel(-4) },
        ] },
        { id: "t3", with: "team", unread: 0, msgs: [
          { from: "them", text: "Welcome to Askıda! Kadıköy Municipality Social Support approved your account. You can now request up to " + A.TOTAL + " items a month.", t: dayLabel(-12) },
        ] },
      ],
      notifs: [
        { id: "n1", icon: "truck", title: "Pickup on Thursday", text: "Winter Jacket · Caferağa Social Support Point, 18:00", time: "1 h", go: ["chat", { t: "t1" }], unread: true },
        { id: "n2", icon: "apple", title: "New food donation nearby", text: "Fresh Apples, 0.8 km away in Caferağa", time: "35 min", go: ["item", { id: "apples" }], unread: true },
        { id: "n3", icon: "leaf", title: "Your donation was delivered", text: "Your prep books reached a student in Göztepe.", time: "9 d", go: ["tracking", {}] },
        { id: "n4", icon: "shield", title: "You're verified", text: "Kadıköy Municipality Social Support approved your account.", time: "12 d", go: ["profile", {}] },
      ],
    };
  }
  let S = LS.get(KEY) || freshState();
  function save() { LS.set(KEY, Object.assign({}, S, { myItems: S.myItems.map((i) => Object.assign({}, i, { photo: null })) })); }

  const freshUI = () => ({ q: "", cats: [], maxKm: 0, ess: false, exMode: "map", sel: "sweater", trackTab: "don", donSel: null, role: "request", pickup: 0, priv: true, draft: null, verifyStage: 1, slide: 0 });
  let ui = freshUI();
  const newDraft = () => ({ step: 1, photo: null, art: null, cat: "", title: "", desc: "", hood: S.hood === "Kadıköy" ? "Caferağa" : S.hood, cond: "Good", qty: "1 piece", pickup: 0, times: ["Weekday evenings"], err: "" });
  const PICKUPS = ["Drop at a partner point", "I hand it over", "Flexible"];

  /* ---------- Lookups & rules ---------- */
  const allItems = () => S.myItems.concat(A.ITEMS);
  const itemById = (id) => allItems().find((i) => i.id === id);
  const who = (id) => A.DONORS[id] || { name: "Neighbor", count: 0, tone: "#C9C2B2" };
  const ini = (n) => n.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const pointFor = (it) => A.POINTS[it.hood] || A.POINTS._;
  const ACTIVE = ["pending", "matched", "scheduled"];
  const RS = { pending: ["Waiting for donor", "wait"], matched: ["Accepted", "ok"], scheduled: ["Pickup scheduled", "ok"], completed: ["Received", "done"], cancelled: ["Cancelled", "off"] };
  const reqInfo = (r) => { const it = r.item ? itemById(r.item) : null; return { title: it ? it.title : r.title, cat: it ? it.cat : r.cat, art: it ? it.art : r.art, donor: it ? it.donor : r.donor, it: it }; };

  function usage() {
    const used = { food: 0, clothing: 0, books: 0, household: 0 }; let active = 0;
    S.requests.forEach((r) => {
      if (r.status === "cancelled") return;
      const c = reqInfo(r).cat; if (c in used) used[c]++;
      if (ACTIVE.indexOf(r.status) > -1) active++;
    });
    const total = Object.keys(used).reduce((a, k) => a + used[k], 0);
    return { used: used, active: active, total: total };
  }
  function check(it) {
    if (it.mine) return { ok: false, code: "mine", msg: "This is your own donation." };
    if (!S.loggedIn || S.guest) return { ok: false, code: "guest", msg: "Create a verified account to request items." };
    const u = usage(), lim = A.LIMITS[it.cat], cl = A.CATS[it.cat].label.toLowerCase();
    if (S.requests.some((r) => r.item === it.id && r.status !== "cancelled")) return { ok: false, code: "dup", msg: "You already requested this item. Each item can be requested once per person." };
    if (u.active >= A.MAX_ACTIVE) return { ok: false, code: "active", msg: "You have " + A.MAX_ACTIVE + " active requests. Collect or cancel one to request more." };
    if (u.used[it.cat] >= lim) return { ok: false, code: "cat", msg: "You've used all " + lim + " " + cl + " requests for " + MONTH + ". They reset on " + RESET.label + "." };
    if (u.total >= A.TOTAL) return { ok: false, code: "total", msg: "You've reached " + A.TOTAL + " requests this month. They reset on " + RESET.label + "." };
    return { ok: true, left: lim - u.used[it.cat], used: u.used[it.cat], lim: lim, active: u.active };
  }
  const firstRequestable = () => { const pref = itemById("sweater"); if (check(pref).ok) return pref; return A.ITEMS.find((i) => check(i).ok) || pref; };

  /* ---------- Small view helpers ---------- */
  const hdr = (title, o) => {
    o = o || {};
    const left = o.noBack ? "<span></span>" : '<button class="ib" data-back aria-label="Back">' + ic(o.close ? "x" : "chev-l") + "</button>";
    return '<header class="hdr">' + left + '<h1 class="hdr-t">' + title + "</h1>" + (o.right || "<span></span>") + "</header>";
  };
  const art = (it, cls) => '<div class="art t-' + it.cat + (cls ? " " + cls : "") + '">' + (it.photo ? '<img src="' + it.photo + '" alt="">' : ART.item(it.art)) + "</div>";
  const heart = (id, cls) => '<button class="heart' + (S.favs.indexOf(id) > -1 ? " on" : "") + (cls ? " " + cls : "") + '" data-act="fav" data-id="' + id + '" aria-label="Save item">' + ic("heart") + "</button>";
  const catChip = (c) => '<span class="chip">' + A.CATS[c].label + "</span>";
  const essChip = (c) => (A.ESSENTIAL.indexOf(c) > -1 ? '<span class="chip ess">' + ic("zap") + "Priority need</span>" : "");
  const avatar = (id, size) => { const d = who(id); return '<span class="av' + (size ? " av-" + size : "") + '" style="--tone:' + d.tone + '">' + (id === "team" ? ART.logo("#fff") : ini(d.name)) + "</span>"; };
  const card = (it) => '<article class="card" data-go="item" data-p="' + P({ id: it.id }) + '">' + art(it) + '<span class="km">' + (it.mine ? "Yours" : it.km.toFixed(1) + " km") + "</span>" + heart(it.id) + '<div class="card-b"><h3>' + esc(it.title) + "</h3><p>" + esc(it.hood) + "</p></div></article>";
  const row = (it) => '<article class="row" data-go="item" data-p="' + P({ id: it.id }) + '">' + art(it, "row-art") + '<div class="row-b"><h3>' + esc(it.title) + '</h3><p class="mut">' + ic("pin") + esc(it.hood) + " · " + (it.mine ? "Your donation" : it.km.toFixed(1) + " km") + '</p><div class="row-chips">' + catChip(it.cat) + essChip(it.cat) + "</div></div>" + heart(it.id) + "</article>";
  const bar = (v, max, cls) => '<span class="bar' + (cls ? " " + cls : "") + '"><i style="width:' + Math.min(100, Math.round((v / max) * 100)) + '%"></i></span>';
  const toggle = (on, act, label) => '<button class="tgl' + (on ? " on" : "") + '" data-act="' + act + '" role="switch" aria-checked="' + on + '" aria-label="' + label + '"><i></i></button>';

  /* ======================================================================
     SCREENS (each returns HTML; M[id] wires up live parts after render)
     ====================================================================== */
  const R = {}, M = {};

  R.welcome = () => '<div class="body welcome">' +
    '<div class="w-top"><div class="w-logo">' + ART.logo("#B67B4C") + '</div><div class="w-name">Askıda</div><p class="w-tag">Share, Support,<br>Reduce Waste.</p></div>' +
    '<div class="w-ill">' + ART.welcome() + "</div>" +
    '<div class="w-cta"><button class="btn" data-go="login">Log In</button><button class="btn ghost" data-go="signup">Sign Up</button><button class="link" data-act="guest">Explore as a Guest ' + ic("arrow-r") + "</button></div></div>";

  R.login = () => hdr("") + '<div class="body form-body">' +
    '<h2 class="big">Welcome back</h2><p class="mut lead">Log in to share and request items in your neighborhood.</p>' +
    '<label class="fld"><span>Email or phone</span><input id="lg-email" type="email" value="mert@askida.app" autocomplete="off"></label>' +
    '<label class="fld"><span>Password</span><input id="lg-pass" type="password" value="askida-demo" autocomplete="off"></label>' +
    '<button class="link small right" data-act="toast" data-msg="A reset link would be sent by SMS or email.">Forgot password?</button>' +
    '<button class="btn" data-act="login">Log In</button>' +
    '<p class="mut center small">New to Askıda? <button class="link inline" data-go="signup">Sign up</button></p>' +
    '<div class="demo-note">' + ic("info") + "<span>Demo account: Mert Yılmaz, 21, verified student in Kadıköy.</span></div></div>";

  R.signup = () => {
    const roles = [
      ["donate", "bag", "Donate & Share", "Give food, clothes, books and household items."],
      ["request", "heart", "Request Support", "Get items you need after a quick verification."],
      ["verify", "building", "Partner Organization", "Verify recipients and help with deliveries."],
    ];
    return hdr("Join Askıda") + '<div class="body form-body"><p class="mut lead">Choose how you want to use Askıda. You can change this later.</p>' +
      '<div class="roles">' + roles.map((r) => '<button class="role' + (ui.role === r[0] ? " on" : "") + '" data-act="role" data-role="' + r[0] + '"><span class="role-i">' + ic(r[1]) + '</span><span class="role-t"><b>' + r[2] + "</b><span>" + r[3] + '</span></span><span class="radio"></span></button>').join("") + "</div>" +
      '<label class="fld"><span>Full name</span><input id="su-name" value="Mert Yılmaz" autocomplete="off"></label>' +
      '<label class="fld"><span>Neighborhood</span><select id="su-hood">' + A.HOODS.map((h) => "<option" + (h === "Kadıköy" ? " selected" : "") + ">" + h + "</option>").join("") + "</select></label>" +
      '<button class="btn" data-act="signup">Continue</button><p class="mut center small">By continuing you agree to the community rules.</p></div>';
  };

  R.verify = () => {
    const st = ui.verifyStage;
    const steps = [
      ["Submit Application", "Tell us about your needs and upload one document.", "Student ID · uploaded"],
      ["Review by Partner Organization", "Kadıköy Municipality Social Support checks your application, usually within 2 days.", st === 2 ? "Reviewing now…" : ""],
      ["Verification Result", "You'll be notified when your account is approved.", st >= 3 ? "Approved" : ""],
    ];
    const cls = (i) => (i + 1 < st || st >= 3 ? "done" : i + 1 === st ? "now" : "");
    return hdr("Verification") + '<div class="body form-body">' +
      '<div class="v-badge">' + ic("shield") + "</div>" +
      '<h2 class="big center">' + (st >= 3 ? "You're verified" : "Verify your account") + '</h2><p class="mut center lead">' + (st >= 3 ? "You can now request up to " + A.TOTAL + " items a month." : "Only verified recipients can request items. This keeps help going to the people who need it.") + "</p>" +
      '<ol class="vsteps">' + steps.map((s, i) => '<li class="' + cls(i) + '"><span class="vdot">' + (cls(i) === "done" ? ic("check") : i + 1) + "</span><div><b>" + s[0] + "</b><p>" + s[1] + "</p>" + (s[2] ? '<span class="vtag">' + s[2] + "</span>" : "") + "</div></li>").join("") + "</ol>" +
      '<div class="secure">' + ic("lock") + "<span>Your documents are only seen by the partner organization. Donors never see them.</span></div>" +
      (st >= 3 ? '<button class="btn" data-act="verified">Continue to Home</button>' : '<button class="btn" data-act="approve"' + (st === 2 ? " disabled" : "") + ">" + (st === 2 ? "Reviewing…" : "Simulate approval") + "</button>") +
      "</div>";
  };

  R.home = () => {
    const u = usage(), unread = S.notifs.some((n) => n.unread);
    const near = allItems().slice().sort((a, b) => (a.mine ? -1 : b.mine ? 1 : a.km - b.km)).slice(0, 8);
    const ess = A.ITEMS.filter((i) => A.ESSENTIAL.indexOf(i.cat) > -1).sort((a, b) => a.km - b.km).slice(0, 3);
    const slides = [
      ["Support someone in your neighborhood today.", ART.hero(), "explore"],
      ["Food and clothing get priority matching.", ART.item("apples"), "limits"],
      ["Your requests stay private. Pick up at a partner point.", '<span class="hero-lock">' + ic("lock") + "</span>", "limits"],
    ];
    const allowance = S.loggedIn && !S.guest
      ? '<button class="allow" data-go="limits"><span class="allow-t"><b>' + (A.TOTAL - u.total) + " of " + A.TOTAL + "</b> requests left in " + MONTH + '</span><span class="allow-a">' + u.active + "/" + A.MAX_ACTIVE + " active " + ic("chev-r") + "</span>" + bar(u.total, A.TOTAL) + "</button>"
      : '<button class="allow guest" data-go="signup"><span class="allow-t"><b>Browsing as a guest.</b> Sign up to request items.</span>' + ic("chev-r") + "</button>";
    return '<div class="body has-tab top-pad">' +
      '<div class="brand-row"><span class="brand">' + ART.logo("#B67B4C") + "<b>Askıda</b></span>" +
      '<button class="ib bell" data-go="notifications" aria-label="Notifications">' + ic("bell") + (unread ? '<i class="dot"></i>' : "") + "</button></div>" +
      '<button class="loc" data-act="loc">' + ic("pin") + "Istanbul, " + esc(S.hood) + ic("chev-d") + "</button>" +
      '<div class="hero"><div class="hero-track" id="heroTrack">' + slides.map((s) => '<div class="slide" data-go="' + s[2] + '"' + (s[2] === "explore" ? ' data-tab="explore"' : "") + '><p>' + s[0] + '</p><div class="slide-art">' + s[1] + "</div></div>").join("") + '</div><div class="dots" id="heroDots">' + slides.map((_, i) => "<i" + (i === 0 ? ' class="on"' : "") + "></i>").join("") + "</div></div>" +
      allowance +
      '<div class="sec-h"><h2>Categories</h2></div><div class="cats">' + Object.keys(A.CATS).map((k) => '<button class="cat" data-act="cat" data-cat="' + k + '"><span>' + ic(A.CATS[k].icon) + "</span>" + A.CATS[k].label + "</button>").join("") + "</div>" +
      '<div class="sec-h"><h2>Nearby Donations</h2><button class="see" data-tab="explore">View All</button></div>' +
      '<div class="hscroll">' + near.map(card).join("") + "</div>" +
      '<div class="sec-h"><h2>Priority needs near you</h2></div><div class="rows">' + ess.map(row).join("") + "</div></div>";
  };
  M.home = (el) => {
    const track = $("#heroTrack", el), dots = $$("#heroDots i", el);
    if (!track) return;
    const set = (i) => dots.forEach((d, j) => d.classList.toggle("on", j === i));
    let i = 0;
    track.addEventListener("scroll", () => { i = Math.round(track.scrollLeft / track.clientWidth); set(i); }, { passive: true });
    const t = setInterval(() => { i = (i + 1) % dots.length; track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? "auto" : "smooth" }); }, 4200);
    cleanups.push(() => clearInterval(t));
  };

  /* ---- Explore ---- */
  function filtered() {
    const q = ui.q.trim().toLowerCase();
    let list = allItems().filter((it) => {
      if (ui.cats.length && ui.cats.indexOf(it.cat) < 0) return false;
      if (ui.maxKm && it.km > ui.maxKm) return false;
      if (!q) return true;
      return (it.title + " " + it.hood + " " + A.CATS[it.cat].label + " " + it.desc).toLowerCase().indexOf(q) > -1;
    });
    list.sort((a, b) => {
      if (ui.ess) { const ea = A.ESSENTIAL.indexOf(a.cat) > -1, eb = A.ESSENTIAL.indexOf(b.cat) > -1; if (ea !== eb) return ea ? -1 : 1; }
      return a.km - b.km;
    });
    return list;
  }
  const filterCount = () => ui.cats.length + (ui.maxKm ? 1 : 0) + (ui.ess ? 1 : 0);
  function exMain() {
    const list = filtered();
    if (ui.exMode === "map") {
      if (list.length && !list.some((i) => i.id === ui.sel)) ui.sel = list[0].id;
      const sel = list.find((i) => i.id === ui.sel);
      return '<div class="map">' + ART.map(list, ui.sel) + '<span class="map-count">' + list.length + " donation" + (list.length === 1 ? "" : "s") + " nearby</span>" +
        '<button class="map-me" data-act="toast" data-msg="Centered on your location in ' + esc(S.hood) + '" aria-label="My location">' + ic("nav") + "</button>" +
        (sel ? '<div class="map-card" data-go="item" data-p="' + P({ id: sel.id }) + '">' + art(sel, "mc-art") + '<div class="mc-b"><h3>' + esc(sel.title) + '</h3><p class="mut">' + ic("pin") + esc(sel.hood) + " · " + (sel.mine ? "Yours" : sel.km.toFixed(1) + " km") + '</p><div class="row-chips">' + catChip(sel.cat) + essChip(sel.cat) + "</div></div>" + heart(sel.id) + "</div>" : '<div class="map-card empty">No donations match. Try another search or filter.</div>') + "</div>";
    }
    return '<div class="body has-tab ex-list">' + (list.length ? '<p class="mut small">' + list.length + " result" + (list.length === 1 ? "" : "s") + (ui.ess ? " · priority needs first" : " · nearest first") + '</p><div class="rows">' + list.map(row).join("") + "</div>" : '<div class="empty-st">' + ic("search") + "<b>No donations found</b><p>Try another word or clear the filters.</p><button class=\"btn soft\" data-act=\"fClear\">Clear filters</button></div>") + "</div>";
  }
  R.explore = () => '<div class="ex-head top-pad"><h1 class="title">Explore</h1>' +
    '<div class="search-row"><label class="search">' + ic("search") + '<input id="q" type="search" placeholder="Search for an item, category or location…" value="' + esc(ui.q) + '" autocomplete="off"></label>' +
    '<button class="ib filt" data-act="filters" aria-label="Filters">' + ic("sliders") + '<i class="fbadge" id="fbadge">' + (filterCount() || "") + "</i></button></div>" +
    '<div class="seg" id="exSeg"><button data-act="exMode" data-m="map" class="' + (ui.exMode === "map" ? "on" : "") + '">Map</button><button data-act="exMode" data-m="list" class="' + (ui.exMode === "list" ? "on" : "") + '">List</button></div>' +
    (ui.cats.length ? '<div class="active-f">' + ui.cats.map((c) => '<button class="chip x" data-act="fRemove" data-cat="' + c + '">' + A.CATS[c].label + ic("x") + "</button>").join("") + "</div>" : "") + "</div>" +
    '<div class="ex-main" id="exMain">' + exMain() + "</div>";
  M.explore = (el) => {
    const q = $("#q", el);
    q.addEventListener("input", () => { ui.q = q.value; $("#exMain", el).innerHTML = exMain(); });
  };
  const updateExplore = () => { if (top().id === "explore") refresh(); };

  /* ---- Item detail ---- */
  R.item = (p) => {
    const it = itemById(p.id) || A.ITEMS[0], d = who(it.donor), c = check(it);
    let cta;
    if (it.mine) cta = '<button class="btn" data-act="trackMine" data-id="' + it.id + '">Track your donation</button>';
    else if (c.ok) cta = '<button class="btn" data-go="request" data-p="' + P({ id: it.id }) + '">Request Item</button><p class="cta-note">' + ic("scale") + "Uses 1 of your " + c.left + " " + A.CATS[it.cat].label.toLowerCase() + " requests left in " + MONTH + "</p>";
    else if (c.code === "guest") cta = '<button class="btn" data-go="signup">Sign up to request</button><p class="cta-note">' + ic("shield") + c.msg + "</p>";
    else if (c.code === "dup") cta = '<button class="btn" disabled>' + ic("check") + 'Already requested</button><p class="cta-note">' + c.msg + ' <button class="link inline" data-act="trackReq">See status</button></p>';
    else cta = '<button class="btn" disabled>Request limit reached</button><p class="cta-note warn">' + ic("alert") + c.msg + ' <button class="link inline" data-go="limits">See rules</button></p>';
    const facts = [["Condition", it.cond], ["Quantity", it.qty], ["Pickup", it.pickup || "Partner point or nearby"]];
    if (it.best) facts.push(["Timing", it.best]);
    return '<div class="body item-body"><div class="item-hero">' + art(it) +
      '<button class="ib float l" data-back aria-label="Back">' + ic("arrow-l") + "</button>" + heart(it.id, "float r") + "</div>" +
      '<div class="item-main"><div class="row-chips">' + catChip(it.cat) + essChip(it.cat) + "</div>" +
      '<h1 class="item-t">' + esc(it.title) + "</h1>" +
      '<p class="meta">' + ic("pin") + esc(it.hood) + ", Istanbul · " + (it.mine ? "Your donation" : it.km.toFixed(1) + " km") + " · " + esc(it.posted) + "</p>" +
      '<h3 class="h3">Description</h3><p class="desc">' + esc(it.desc) + "</p>" +
      '<div class="facts">' + facts.map((f) => "<div><span>" + f[0] + "</span><b>" + esc(f[1]) + "</b></div>").join("") + "</div>" +
      '<div class="donor">' + avatar(it.donor, "lg") + '<div><b>' + esc(it.mine ? "You" : d.name) + '</b><span>' + (it.mine ? "Donor" : (d.label || "Donor") + " · " + d.count + " donations") + "</span></div>" + (it.mine ? "" : '<span class="vchip">' + ic("shield") + "Verified</span>") + "</div>" +
      '<p class="safe-note">' + ic("lock") + "Pickup happens at a partner point or a public place. Nobody shares an address.</p></div></div>" +
      '<div class="cta-bar">' + cta + "</div>";
  };

  /* ---- Request (fair-use check) ---- */
  R.request = (p) => {
    const it = itemById(p.id) || firstRequestable(), c = check(it), u = usage(), cl = A.CATS[it.cat].label;
    const head = hdr("Request Item") + '<div class="body">' +
      '<div class="mini">' + art(it, "mini-art") + "<div><b>" + esc(it.title) + '</b><span class="mut">' + esc(who(it.donor).name) + " · " + esc(it.hood) + " · " + it.km.toFixed(1) + " km</span></div></div>";
    if (!c.ok) return head + '<div class="blocked">' + ic("alert") + "<b>You can't request this item</b><p>" + c.msg + '</p><button class="btn soft" data-go="limits">See the fair distribution rules</button></div></div>';
    const ok = (t, s) => '<li><span class="ck">' + ic("check") + "</span><div><b>" + t + "</b><span>" + s + "</span></div></li>";
    const pts = [[pointFor(it), "Recommended · staff keep your item until you arrive"], ["Meet the donor nearby", "Agree on a public place in the chat"]];
    return head +
      '<h3 class="h3">Fair-use check</h3><ul class="checks">' +
      ok("Verified account", "Kadıköy Municipality Social Support") +
      ok(cl + " this month", c.used + " of " + c.lim + " used · " + (c.left - 1) + " left after this") +
      ok("Active requests", u.active + " of " + A.MAX_ACTIVE + " · " + (u.active + 1) + " after this") +
      ok("First request for this item", "Each item can be requested once") +
      (A.ESSENTIAL.indexOf(it.cat) > -1 ? '<li class="prio"><span class="ck">' + ic("zap") + "</span><div><b>Priority need</b><span>" + cl + " requests are matched first</span></div></li>" : "") + "</ul>" +
      '<h3 class="h3">Pickup</h3><div class="opts">' + pts.map((o, i) => '<button class="opt' + (ui.pickup === i ? " on" : "") + '" data-act="pickup" data-i="' + i + '"><span class="radio"></span><span><b>' + esc(o[0]) + "</b><span>" + o[1] + "</span></span></button>").join("") + "</div>" +
      '<div class="tgl-row"><div><b>Keep my request private</b><span>The donor sees “Verified neighbor” instead of your name.</span></div>' + toggle(ui.priv, "priv", "Keep my request private") + "</div>" +
      '<label class="fld"><span>Message to donor (optional)</span><textarea id="reqMsg" rows="2" placeholder="e.g. I can pick it up after my classes."></textarea></label></div>' +
      '<div class="cta-bar"><button class="btn" data-act="confirmReq" data-id="' + it.id + '">Confirm Request</button></div>';
  };

  R.requested = (p) => {
    const r = S.requests.find((x) => x.id === p.rid) || S.requests.find((x) => x.item) || S.requests[0];
    const inf = reqInfo(r), accepted = r.status !== "pending";
    return '<div class="body done-body top-pad">' +
      '<div class="burst"><span class="burst-c">' + ic("check") + "</span></div>" +
      '<h1 class="big center">Request sent</h1><p class="mut center lead">We sent your request to ' + esc(who(inf.donor).name.replace(/\.$/, "")) + ". You'll get a notification when they accept.</p>" +
      '<div class="sum">' + (inf.it ? art(inf.it, "mini-art") : "") + "<div><b>" + esc(inf.title) + '</b><span class="mut">' + esc(r.point || "Partner point") + '</span><span class="row-chips">' + (r.private ? '<span class="chip">' + ic("eyeoff") + "Private</span>" : "") + '<span class="chip code">Code ' + esc(r.code || "AS-0000") + "</span></span></div></div>" +
      '<h3 class="h3">What happens next</h3><ol class="next"><li class="' + (accepted ? "done" : "now") + '"><b>' + (accepted ? "Donor accepted" : "Donor reviews your request") + "</b><span>" + (accepted ? "Check Messages to agree on a time." : "Usually within a few hours.") + "</span></li><li><b>Pickup is scheduled</b><span>At the partner point, with your code.</span></li><li><b>You collect the item</b><span>This frees one of your active request slots.</span></li></ol>" +
      '<div class="btn-col"><button class="btn" data-act="trackReq">Track request</button><button class="btn ghost" data-tab="home">Back to Home</button></div></div>';
  };

  /* ---- Donate (3 steps) ---- */
  R.donate = () => {
    const d = ui.draft || (ui.draft = newDraft());
    const dots = '<div class="steps">' + [1, 2, 3].map((n) => '<i class="' + (n < d.step ? "done" : n === d.step ? "now" : "") + '"></i>').join("<b></b>") + "</div>";
    let b = "";
    if (d.step === 1) {
      b = '<input id="photoIn" type="file" accept="image/*" hidden>' +
        (d.photo || d.art
          ? '<div class="photo-prev t-' + (d.cat || "household") + '">' + (d.photo ? '<img src="' + d.photo + '" alt="Your photo">' : ART.item(d.art)) + '<button class="chip change" data-act="pickPhoto">' + ic("camera") + "Change</button></div>"
          : '<button class="photo-add" data-act="pickPhoto">' + ic("camera") + "<b>Add a Photo</b><span>Clear photos get matched faster</span></button>") +
        (d.photo || d.art ? "" : '<button class="link small center-b" data-act="samplePhoto">or use a sample photo</button>') +
        '<label class="fld"><span>Category</span><div class="cat-pick">' + Object.keys(A.CATS).map((k) => '<button class="cp' + (d.cat === k ? " on" : "") + '" data-act="dCat" data-cat="' + k + '">' + ic(A.CATS[k].icon) + A.CATS[k].label + "</button>").join("") + "</div></label>" +
        '<label class="fld"><span>Item Title</span><input id="d-title" data-bind="title" placeholder="e.g. Winter Jacket" value="' + esc(d.title) + '" autocomplete="off"></label>' +
        '<label class="fld"><span>Description</span><textarea id="d-desc" data-bind="desc" rows="3" placeholder="Condition, size, quantity, etc.">' + esc(d.desc) + "</textarea></label>" +
        '<label class="fld"><span>Location</span><span class="sel-wrap">' + ic("pin") + '<select id="d-hood" data-bind="hood">' + A.HOODS.slice(1).map((h) => "<option" + (h === d.hood ? " selected" : "") + ">" + h + "</option>").join("") + "</select>" + ic("chev-d") + "</span></label>" +
        (d.err ? '<p class="err">' + ic("alert") + d.err + "</p>" : "") +
        '<button class="btn" data-act="dNext">Next</button>';
    } else if (d.step === 2) {
      const chips = (key, arr, multi) => '<div class="chips-pick">' + arr.map((v) => '<button class="cp' + ((multi ? d[key].indexOf(v) > -1 : d[key] === v) ? " on" : "") + '" data-act="dPick" data-k="' + key + '" data-v="' + esc(v) + '"' + (multi ? ' data-multi="1"' : "") + ">" + esc(v) + "</button>").join("") + "</div>";
      b = '<div class="fld"><span>Condition</span>' + chips("cond", ["New", "Like new", "Good", "Fair"]) + "</div>" +
        '<label class="fld"><span>Quantity</span><input id="d-qty" data-bind="qty" value="' + esc(d.qty) + '" autocomplete="off"></label>' +
        '<div class="fld"><span>Pickup</span><div class="opts">' + PICKUPS.map((o, i) => '<button class="opt' + (d.pickup === i ? " on" : "") + '" data-act="dPickup" data-i="' + i + '"><span class="radio"></span><span><b>' + o + "</b><span>" + ["Staff hand it to the recipient. Most private.", "You meet the recipient in a public place.", "Decide together in the chat."][i] + "</span></span></button>").join("") + "</div></div>" +
        '<div class="fld"><span>Available</span>' + chips("times", ["Weekday evenings", "Weekend mornings", "Weekend afternoons", "Anytime"], true) + "</div>" +
        '<div class="btn-row"><button class="btn ghost" data-act="dPrev">Back</button><button class="btn" data-act="dNext">Next</button></div>';
    } else {
      const pv = { id: "preview", title: d.title, cat: d.cat, art: d.art || A.CAT_ART[d.cat], photo: d.photo, hood: d.hood, km: 0 };
      b = '<p class="mut small">This is how neighbors will see your donation.</p><div class="preview">' + art(pv, "pv-art") + '<div class="pv-b"><div class="row-chips">' + catChip(d.cat) + essChip(d.cat) + "</div><h3>" + esc(d.title) + '</h3><p class="mut">' + ic("pin") + esc(d.hood) + ", Istanbul</p><p class=\"desc\">" + esc(d.desc || "No description added.") + "</p></div></div>" +
        '<div class="facts">' + [["Condition", d.cond], ["Quantity", d.qty], ["Pickup", PICKUPS[d.pickup]], ["Available", d.times.join(", ") || "Flexible"]].map((f) => "<div><span>" + f[0] + "</span><b>" + esc(f[1]) + "</b></div>").join("") + "</div>" +
        (A.ESSENTIAL.indexOf(d.cat) > -1 ? '<p class="info-note">' + ic("zap") + A.CATS[d.cat].label + " is a priority need, so it will be matched first.</p>" : "") +
        '<div class="btn-row"><button class="btn ghost" data-act="dPrev">Back</button><button class="btn" data-act="publish">Publish Donation</button></div>';
    }
    return hdr("Make a Donation", { close: true }) + dots + '<div class="body form-body donate-body">' + b + "</div>";
  };
  M.donate = (el) => {
    $$("[data-bind]", el).forEach((f) => f.addEventListener("input", () => { ui.draft[f.dataset.bind] = f.value; }));
    const inp = $("#photoIn", el);
    if (inp) inp.addEventListener("change", () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = () => {
        const img = new Image();
        img.onload = () => {
          const s = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement("canvas");
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          ui.draft.photo = c.toDataURL("image/jpeg", 0.85); refresh();
        };
        img.src = rd.result;
      };
      rd.readAsDataURL(f);
    });
  };

  R.donated = (p) => {
    const don = S.donations.find((x) => x.id === p.did) || S.donations[0];
    const matched = don.step >= 2;
    return '<div class="body done-body top-pad">' +
      '<div class="radar' + (matched ? " found" : "") + '"><i></i><i></i><i></i><span class="radar-c">' + (matched ? ic("check") : ic("bag")) + "</span></div>" +
      '<h1 class="big center">' + (matched ? "Matched!" : "Donation published") + "</h1>" +
      '<p class="mut center lead">' + (matched ? "A verified neighbor in " + esc(don.to || "Caferağa") + " (0.9 km away) needs your " + esc(don.title.toLowerCase()) + "." : "Looking for a verified neighbor nearby who needs it…") + "</p>" +
      '<div class="sum">' + art({ cat: don.cat, art: don.art, photo: (itemById(don.item) || {}).photo }, "mini-art") + "<div><b>" + esc(don.title) + '</b><span class="mut">' + (matched ? "Matched · " + (don.times[1] || stamp()) : "Live since " + (don.times[0] || stamp())) + "</span></div></div>" +
      '<div class="btn-col"><button class="btn" data-act="trackDon" data-id="' + don.id + '">Track donation</button><button class="btn ghost" data-tab="home">Back to Home</button></div></div>';
  };

  /* ---- Tracking ---- */
  const DSTEPS = [
    ["Donation Created", "Your item is live for neighbors nearby."],
    ["Matched", "Your item has been matched with a nearby recipient."],
    ["Delivery Scheduled", "The delivery time has been set."],
    ["Completed", "Your donation has been delivered."],
  ];
  R.tracking = () => {
    const tab = ui.trackTab;
    let inner = "";
    if (tab === "don") {
      if (!S.donations.length) inner = '<div class="empty-st">' + ic("bag") + '<b>No donations yet</b><p>Share something you no longer need.</p><button class="btn" data-act="donateTab">Make a donation</button></div>';
      else {
        const don = S.donations.find((x) => x.id === ui.donSel) || S.donations[0];
        inner = (S.donations.length > 1 ? '<div class="don-pick">' + S.donations.map((x) => '<button class="cp' + (x.id === don.id ? " on" : "") + '" data-act="donSel" data-id="' + x.id + '">' + esc(x.title) + "</button>").join("") + "</div>" : "") +
          '<div class="mini">' + art({ cat: don.cat, art: don.art, photo: (itemById(don.item) || {}).photo }, "mini-art") + "<div><b>" + esc(don.title) + '</b><span class="mut">' + A.CATS[don.cat].label + (don.to && don.step >= 2 ? " · to a verified neighbor in " + esc(don.to) : "") + "</span></div></div>" +
          '<ol class="tl">' + DSTEPS.map((s, i) => {
            const n = i + 1, st = n < don.step ? "done" : n === don.step ? (n === 4 ? "done last" : "now") : "";
            return '<li class="' + st + '"><span class="tl-d">' + (n <= don.step ? ic("check") : "") + "</span><div><b>" + s[0] + "</b>" + (n <= don.step ? "<p>" + s[1] + '</p><span class="tl-t">' + esc(don.times[i] || "") + "</span>" : '<p class="mut">Waiting</p>') + "</div></li>";
          }).join("") + "</ol>" +
          (don.step >= 4
            ? '<div class="impact">' + ic("leaf") + "<div><b>Your Impact</b><p>You have supported someone's need and helped reduce waste. Thank you! " + ic("heart", "tiny") + "</p></div></div>"
            : '<button class="link small center-b" data-act="advance" data-id="' + don.id + '">' + ic("arrow-r") + "Next status (demo)</button>");
      }
    } else {
      const u = usage();
      inner = '<button class="allow" data-go="limits"><span class="allow-t"><b>' + u.total + " of " + A.TOTAL + "</b> used in " + MONTH + '</span><span class="allow-a">' + u.active + "/" + A.MAX_ACTIVE + " active " + ic("chev-r") + "</span>" + bar(u.total, A.TOTAL) + "</button>" +
        '<div class="reqs">' + S.requests.map((r) => {
          const inf = reqInfo(r), s = RS[r.status], act = ACTIVE.indexOf(r.status) > -1;
          const th = S.threads.find((t) => (r.item && t.item === r.item) || t.id === "t" + r.id);
          return '<div class="req ' + s[1] + '"><div class="req-top">' + art({ cat: inf.cat, art: inf.art }, "req-art") + "<div><b>" + esc(inf.title) + '</b><span class="mut">' + esc(who(inf.donor).name) + " · " + esc(r.when || "Today") + '</span></div><span class="st st-' + s[1] + '">' + s[0] + "</span></div>" +
            (act ? '<div class="req-act">' + (th ? '<button class="cp" data-go="chat" data-p="' + P({ t: th.id }) + '">' + ic("msg") + "Message</button>" : "") + '<button class="cp" data-act="cancelReq" data-id="' + r.id + '">' + ic("x") + "Cancel request</button></div>" : "") + "</div>";
        }).join("") + "</div>";
    }
    return hdr("Donation Tracking") + '<div class="seg in-hdr"><button data-act="tTab" data-t="don" class="' + (tab === "don" ? "on" : "") + '">My Donations</button><button data-act="tTab" data-t="req" class="' + (tab === "req" ? "on" : "") + '">My Requests</button></div><div class="body">' + inner + "</div>";
  };

  /* ---- Messages & chat ---- */
  const guestWall = (t) => '<div class="empty-st">' + ic("lock") + "<b>" + t + '</b><p>Create an account to message donors and track requests.</p><button class="btn" data-go="signup">Sign up</button></div>';
  R.messages = () => {
    const body = S.guest ? guestWall("Messages are for members") : '<div class="priv-note">' + ic("lock") + "<span>Phone numbers and addresses are never shared in Askıda chats.</span></div>" +
      '<div class="threads">' + S.threads.map((t) => {
        const d = who(t.with), last = t.msgs.filter((m) => !m.type).slice(-1)[0] || {}, it = t.item ? itemById(t.item) : null;
        return '<button class="thread" data-go="chat" data-p="' + P({ t: t.id }) + '">' + avatar(t.with, "lg") + '<div class="th-b"><div class="th-top"><b>' + esc(d.name) + '</b><span class="mut small">' + esc(last.t || "") + '</span></div><span class="th-item">' + esc(it ? it.title : t.title || "Askıda") + '</span><span class="th-last">' + (last.from === "me" ? "You: " : "") + esc(last.text || "") + "</span></div>" + (t.unread ? '<i class="ub">' + t.unread + "</i>" : "") + "</button>";
      }).join("") + "</div>";
    return '<div class="body has-tab top-pad"><h1 class="title">Messages</h1>' + body + "</div>";
  };
  const msgHTML = (m, t) => {
    if (m.type === "pickup") return '<div class="pick-card">' + ic("cal") + "<div><b>Pickup scheduled</b><span>" + esc(m.text) + '</span><span class="code">Code ' + esc(m.code) + "</span></div></div>";
    if (m.type === "typing") return '<div class="bub them typing"><i></i><i></i><i></i></div>';
    return '<div class="bub ' + m.from + '">' + esc(m.text) + '<span class="bt">' + esc(m.t || "") + "</span></div>";
  };
  R.chat = (p) => {
    const t = S.threads.find((x) => x.id === p.t) || S.threads[0], d = who(t.with), it = t.item ? itemById(t.item) : null;
    t.unread = 0; save(); syncBadges();
    const quick = t.with === "team" ? ["How do limits work?", "Thanks!"] : ["I can pick it up tomorrow", "Can we use the partner point?", "Thank you so much!"];
    return '<header class="hdr chat-h"><button class="ib" data-back aria-label="Back">' + ic("chev-l") + "</button>" +
      '<div class="ch-who">' + avatar(t.with) + "<div><b>" + esc(d.name) + "</b><span>" + (t.with === "team" ? "Askıda support" : "Donor · replies in about 1 h") + "</span></div></div><span></span></header>" +
      (it ? '<button class="ch-item" data-go="item" data-p="' + P({ id: it.id }) + '">' + art(it, "chi-art") + "<span><b>" + esc(it.title) + "</b><span>" + esc(it.hood) + " · " + it.km.toFixed(1) + " km</span></span>" + ic("chev-r") + "</button>" : "") +
      '<div class="body chat-body" id="msgs"><p class="priv-note small">' + ic("eyeoff") + (t.with === "team" ? "Messages with the Askıda team are private." : esc(d.name) + " sees you as “Verified neighbor”.") + "</p>" + t.msgs.map((m) => msgHTML(m, t)).join("") + "</div>" +
      '<div class="quick">' + quick.map((q) => '<button class="cp" data-act="quick" data-q="' + esc(q) + '">' + esc(q) + "</button>").join("") + "</div>" +
      '<form class="composer-in" id="chatForm"><input id="chatIn" placeholder="Write a message…" autocomplete="off"><button class="send" aria-label="Send">' + ic("send") + "</button></form>";
  };
  M.chat = (el, p) => {
    const box = $("#msgs", el); box.scrollTop = box.scrollHeight;
    $("#chatForm", el).addEventListener("submit", (e) => { e.preventDefault(); const i = $("#chatIn", el); sendMsg(p.t, i.value); i.value = ""; });
  };
  function sendMsg(tid, text) {
    text = (text || "").trim(); if (!text) return;
    const t = S.threads.find((x) => x.id === tid) || S.threads[0];
    t.msgs.push({ from: "me", text: text, t: clock() }); save();
    const box = $("#msgs");
    if (box) { box.insertAdjacentHTML("beforeend", msgHTML(t.msgs[t.msgs.length - 1])); box.insertAdjacentHTML("beforeend", msgHTML({ type: "typing" })); box.scrollTop = box.scrollHeight; }
    const low = text.toLowerCase();
    let reply = "Sounds good. See you at the pickup point!";
    if (t.with === "team") reply = low.indexOf("limit") > -1 ? "Each month you can request up to " + A.TOTAL + " items: food " + A.LIMITS.food + ", clothing " + A.LIMITS.clothing + ", books " + A.LIMITS.books + ", household " + A.LIMITS.household + ". You can have " + A.MAX_ACTIVE + " active requests at a time." : "You're welcome! Write to us anytime.";
    else if (low.indexOf("thank") > -1) reply = "You're welcome! I'm glad it's going to someone who needs it.";
    else if (low.indexOf("tomorrow") > -1 || low.indexOf("when") > -1) reply = "Tomorrow after 18:00 works for me.";
    else if (low.indexOf("partner") > -1) reply = "Yes, I'll leave it at the partner point with your code.";
    setTimeout(() => {
      t.msgs.push({ from: "them", text: reply, t: clock() }); save();
      const b = $("#msgs");
      if (b && top().id === "chat") { const ty = $(".typing", b); if (ty) ty.remove(); b.insertAdjacentHTML("beforeend", msgHTML(t.msgs[t.msgs.length - 1])); b.scrollTop = b.scrollHeight; }
    }, 1400);
  }

  /* ---- Profile, limits, notifications ---- */
  R.profile = () => {
    if (S.guest) return '<div class="body has-tab top-pad"><h1 class="title">Profile</h1>' + guestWall("You're browsing as a guest") + "</div>";
    const u = usage(), given = S.donations.filter((d) => d.step >= 4).length, got = S.requests.filter((r) => r.status === "completed").length;
    return '<div class="body has-tab top-pad"><h1 class="title">Profile</h1>' +
      '<div class="me"><span class="av av-xl" style="--tone:#A8B69A">MY</span><div><b>Mert Yılmaz</b><span class="mut">' + ic("pin") + esc(S.hood) + ', Istanbul</span><span class="vchip">' + ic("shield") + "Verified by Kadıköy Municipality</span></div></div>" +
      '<div class="stats"><div><b>' + S.donations.length + "</b><span>Donated</span></div><div><b>" + got + "</b><span>Received</span></div><div><b>" + u.active + "</b><span>Active requests</span></div></div>" +
      '<button class="allow-card" data-go="limits"><div class="ac-top"><span><b>Monthly requests</b><span class="mut small">' + MONTH + " · resets " + RESET.label + '</span></span><span class="ac-n">' + (A.TOTAL - u.total) + '<small> left</small></span></div>' + bar(u.total, A.TOTAL, "lg") +
      '<div class="ac-grid">' + Object.keys(A.LIMITS).map((k) => '<div><span class="ac-l">' + ic(A.CATS[k].icon) + A.CATS[k].label + '</span><span class="ac-v">' + u.used[k] + "/" + A.LIMITS[k] + "</span>" + bar(u.used[k], A.LIMITS[k], u.used[k] >= A.LIMITS[k] ? "full" : "") + "</div>").join("") + "</div>" +
      '<div class="ac-foot"><span>' + ic("clock") + u.active + " of " + A.MAX_ACTIVE + " active requests</span><span>See rules " + ic("chev-r") + "</span></div></button>" +
      '<div class="menu">' +
      '<button data-act="trackReq">' + ic("list") + "<span>My requests</span>" + ic("chev-r") + "</button>" +
      '<button data-act="trackDon">' + ic("bag") + "<span>My donations</span>" + ic("chev-r") + "</button>" +
      '<button data-act="toast" data-msg="You have ' + S.favs.length + ' saved items.">' + ic("heart") + "<span>Saved items</span><em>" + S.favs.length + "</em>" + ic("chev-r") + "</button>" +
      '<button data-go="verify">' + ic("shield") + "<span>Verification</span><em>Approved</em>" + ic("chev-r") + "</button>" +
      '<button data-go="notifications">' + ic("bell") + "<span>Notifications</span>" + ic("chev-r") + "</button>" +
      '<div class="menu-tgl">' + ic("eyeoff") + "<span>Private requests by default</span>" + toggle(S.privateDefault, "privDefault", "Private requests by default") + "</div>" +
      '<button class="danger" data-act="logout">' + ic("logout") + "<span>Log out</span></button></div></div>";
  };

  R.limits = () => {
    const u = usage();
    const rules = [
      ["calendar", "cal", "Up to " + A.TOTAL + " items a month", "Each category has its own monthly limit (table below)."],
      ["active", "clock", A.MAX_ACTIVE + " active requests at a time", "Collect or cancel one to free a slot."],
      ["once", "check", "One request per item", "You can't request the same item twice."],
      ["prio", "zap", "Priority for essential needs", "Food and clothing requests are matched first."],
      ["track", "user", "Track it in your profile", "Your remaining requests are always visible."],
    ];
    return hdr("Fair Distribution") + '<div class="body">' +
      '<div class="fd-hero">' + ic("scale") + "<div><b>Everyone gets a fair chance</b><p>Monthly limits stop a few people from taking most items, so help reaches more neighbors.</p></div></div>" +
      '<div class="fd-total"><div><span class="mut small">' + MONTH + '</span><b>' + u.total + " of " + A.TOTAL + ' used</b></div><span class="fd-reset">Resets ' + RESET.label + "<br><span class=\"mut\">in " + RESET.days + " day" + (RESET.days === 1 ? "" : "s") + "</span></span></div>" + bar(u.total, A.TOTAL, "lg") +
      '<table class="lim-t"><thead><tr><th>Category</th><th>Monthly limit</th><th>Used</th></tr></thead><tbody>' +
      Object.keys(A.LIMITS).map((k) => "<tr><td>" + ic(A.CATS[k].icon) + A.CATS[k].label + (A.ESSENTIAL.indexOf(k) > -1 ? '<span class="chip ess sm">' + ic("zap") + "Priority</span>" : "") + "</td><td>" + A.LIMITS[k] + " items</td><td>" + u.used[k] + bar(u.used[k], A.LIMITS[k], u.used[k] >= A.LIMITS[k] ? "full" : "") + "</td></tr>").join("") +
      '</tbody><tfoot><tr><td>Total</td><td>' + A.TOTAL + " items</td><td>" + u.total + "</td></tr></tfoot></table>" +
      '<div class="fd-active"><span>' + ic("clock") + "Active requests</span><span class=\"slots\">" + [0, 1, 2].slice(0, A.MAX_ACTIVE).map((i) => "<i" + (i < u.active ? ' class="on"' : "") + "></i>").join("") + "</span><b>" + u.active + "/" + A.MAX_ACTIVE + "</b></div>" +
      '<h3 class="h3">The rules</h3><ul class="rules">' + rules.map((r) => "<li>" + ic(r[1]) + "<div><b>" + r[2] + "</b><span>" + r[3] + "</span></div></li>").join("") + "</ul></div>";
  };

  R.notifications = () => hdr("Notifications", { right: '<button class="link small" data-act="readAll">Mark all read</button>' }) +
    '<div class="body"><div class="notifs">' + S.notifs.map((n) => '<button class="notif' + (n.unread ? " unread" : "") + '" data-act="openNotif" data-id="' + n.id + '"><span class="n-i">' + ic(n.icon) + "</span><span class=\"n-b\"><b>" + esc(n.title) + "</b><span>" + esc(n.text) + '</span></span><span class="n-t">' + esc(n.time) + "</span></button>").join("") + "</div></div>";

  /* ======================================================================
     NAVIGATION
     ====================================================================== */
  const appEl = $("#app"), layer = $("#screens"), tabbar = $("#tabbar");
  let stack = [], current = null, cleanups = [];
  const TAB_SCREENS = ["home", "explore", "messages", "profile"];
  const top = () => stack[stack.length - 1];

  function build(entry) {
    const el = document.createElement("section");
    el.className = "scr scr-" + entry.id;
    el.innerHTML = R[entry.id](entry.p || {});
    if (TAB_SCREENS.indexOf(entry.id) > -1) el.classList.add("with-tab");
    return el;
  }
  function show(mode) {
    const entry = top();
    cleanups.forEach((f) => f()); cleanups = [];
    $$(".scr", layer).forEach((s) => { if (s !== current) s.remove(); });
    const old = current, el = build(entry);
    if (old && (mode === "pop" || mode === "down")) layer.insertBefore(el, old); else layer.appendChild(el);
    current = el;
    const b = $(".body", el); if (b && entry.scroll) b.scrollTop = entry.scroll;
    if (M[entry.id]) M[entry.id](el, entry.p || {});
    syncChrome(entry);
    if (!old) return;
    if (mode === "none" || reduced) { old.remove(); return; }
    const ease = "cubic-bezier(.2,.8,.2,1)", o = { duration: 360, easing: ease, fill: "forwards" };
    let a, n;
    if (mode === "push") { a = [{ transform: "translateX(0)" }, { transform: "translateX(-28%)", filter: "brightness(.94)" }]; n = [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }]; }
    else if (mode === "pop") { a = [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }]; n = [{ transform: "translateX(-28%)", filter: "brightness(.94)" }, { transform: "translateX(0)", filter: "brightness(1)" }]; }
    else if (mode === "up") { a = [{ opacity: 1 }, { opacity: 1 }]; n = [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }]; }
    else if (mode === "down") { a = [{ transform: "translateY(0)" }, { transform: "translateY(100%)" }]; n = [{ opacity: 1 }, { opacity: 1 }]; }
    else { a = [{ opacity: 1 }, { opacity: 0 }]; n = [{ opacity: 0, transform: "scale(.99)" }, { opacity: 1, transform: "scale(1)" }]; o.duration = 240; }
    if (mode === "pop" || mode === "down") old.style.zIndex = 3;
    old.style.pointerEvents = "none";
    old.animate(a, o);
    const an = el.animate(n, { duration: o.duration, easing: ease });
    const done = () => { if (old.parentNode && old !== current) old.remove(); };
    an.onfinish = done;
    // safety net: browsers pause animations in background tabs, so finish them anyway
    setTimeout(() => { try { if (an.playState !== "finished") an.finish(); } catch (e) { /* ignore */ } done(); }, o.duration + 150);
  }
  function saveScroll() { const e = top(); if (e && current) { const b = $(".body", current); if (b) e.scroll = b.scrollTop; } }
  function go(id, p, mode) { saveScroll(); stack.push({ id: id, p: p || {}, modal: mode === "up" }); show(mode || "push"); }
  function back() { if (stack.length < 2) return; const leaving = stack.pop(); show(leaving.modal ? "down" : "pop"); }
  function tab(id) { if (top() && top().id === id && stack.length === 1) return; stack = [{ id: id, p: {} }]; show("fade"); }
  function reset(list, mode) { stack = list.map((x) => ({ id: x[0], p: x[1] || {}, modal: !!x[2] })); show(mode || "fade"); }
  function refresh() { saveScroll(); show("none"); }
  function refreshIf(ids) { if (top() && ids.indexOf(top().id) > -1) refresh(); }

  function syncBadges() {
    const n = S.threads.reduce((a, t) => a + (t.unread || 0), 0);
    $(".badge", tabbar).textContent = n ? String(n) : "";
  }
  function syncChrome(entry) {
    const isTab = TAB_SCREENS.indexOf(entry.id) > -1 && !(entry.id === "home" && false);
    tabbar.classList.toggle("show", isTab);
    $$("button", tabbar).forEach((b) => b.classList.toggle("on", b.dataset.tab === entry.id));
    syncBadges();
    window.dispatchEvent(new CustomEvent("proto:screen", { detail: { id: entry.id } }));
  }

  /* ---------- Overlays: toast, banner, sheet ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }
  let bannerT;
  function banner(title, text, target) {
    const b = $("#banner");
    b.innerHTML = '<span class="bn-i">' + ART.logo("#fff") + '</span><span class="bn-b"><span class="bn-h">ASKIDA · now</span><b>' + esc(title) + "</b><span>" + esc(text) + "</span></span>";
    b.onclick = () => { b.classList.remove("show"); if (target) go(target[0], target[1]); };
    b.classList.add("show"); clearTimeout(bannerT); bannerT = setTimeout(() => b.classList.remove("show"), 5200);
  }
  function openSheet(html) { $("#sheetPanel").innerHTML = '<span class="grab"></span>' + html; $("#sheet").classList.add("show"); }
  function closeSheet() { $("#sheet").classList.remove("show"); }
  function filterSheet() {
    openSheet('<h3 class="sh-t">Filters</h3><div class="fld"><span>Categories</span><div class="chips-pick">' + Object.keys(A.CATS).map((k) => '<button class="cp' + (ui.cats.indexOf(k) > -1 ? " on" : "") + '" data-act="fCat" data-cat="' + k + '">' + ic(A.CATS[k].icon) + A.CATS[k].label + "</button>").join("") + "</div></div>" +
      '<div class="fld"><span>Distance</span><div class="chips-pick">' + [[1, "Under 1 km"], [2, "Under 2 km"], [3, "Under 3 km"], [0, "Any"]].map((d) => '<button class="cp' + (ui.maxKm === d[0] ? " on" : "") + '" data-act="fKm" data-km="' + d[0] + '">' + d[1] + "</button>").join("") + "</div></div>" +
      '<div class="tgl-row"><div><b>Priority needs first</b><span>Show food and clothing at the top.</span></div>' + toggle(ui.ess, "fEss", "Priority needs first") + "</div>" +
      '<div class="btn-row"><button class="btn ghost" data-act="fClear">Clear</button><button class="btn" data-act="fApply">Show results</button></div>');
  }

  /* ---------- Simulations ---------- */
  function scheduleAccept(rid) {
    setTimeout(() => {
      const r = S.requests.find((x) => x.id === rid); if (!r || r.status !== "pending") return;
      r.status = "matched";
      const it = itemById(r.item), d = who(it.donor);
      const th = { id: "t" + r.id, with: it.donor, item: it.id, unread: 1, msgs: [{ from: "them", text: "Hi! Happy to give you the " + it.title.toLowerCase() + ". Does tomorrow after 18:00 at " + r.point + " work for you?", t: clock() }] };
      S.threads.unshift(th);
      S.notifs.unshift({ id: "n" + Date.now(), icon: "check", title: d.name + " accepted your request", text: it.title + " · " + r.point, time: "now", go: ["chat", { t: th.id }], unread: true });
      save(); syncBadges();
      banner(d.name + " accepted your request", it.title + " · tap to arrange pickup", ["chat", { t: th.id }]);
      refreshIf(["requested", "tracking", "messages", "home", "notifications"]);
    }, 4200);
  }
  function scheduleMatch(did) {
    setTimeout(() => {
      const don = S.donations.find((x) => x.id === did); if (!don || don.step !== 1) return;
      don.step = 2; don.to = "Caferağa"; don.times[1] = stamp();
      S.notifs.unshift({ id: "n" + Date.now(), icon: "users", title: "Your donation was matched", text: don.title + " · a verified neighbor 0.9 km away", time: "now", go: ["tracking", {}], unread: true });
      save();
      if (top().id === "donated") refresh(); else banner("Your donation was matched", don.title + " · a verified neighbor 0.9 km away", ["tracking", {}]);
      refreshIf(["tracking", "home"]);
    }, 2800);
  }

  /* ---------- Actions ---------- */
  const ACT = {
    toast: (t) => toast(t.dataset.msg),
    guest: () => { S.guest = true; S.loggedIn = false; save(); reset([["home"]]); toast("You're browsing as a guest"); },
    login: () => { S.loggedIn = true; S.guest = false; save(); reset([["home"]]); toast("Welcome back, Mert"); },
    role: (t) => { ui.role = t.dataset.role; $$(".role", current).forEach((r) => r.classList.toggle("on", r === t)); },
    signup: () => {
      if (ui.role === "request") { ui.verifyStage = 1; go("verify"); return; }
      S.loggedIn = true; S.guest = false; save(); reset([["home"]]);
      toast(ui.role === "verify" ? "Partner accounts get a verification dashboard (next version)" : "Welcome to Askıda");
    },
    approve: () => { ui.verifyStage = 2; refresh(); setTimeout(() => { ui.verifyStage = 3; if (top().id === "verify") refresh(); }, 1500); },
    verified: () => { S.loggedIn = true; S.guest = false; save(); reset([["home"]]); banner("You're verified", "You can now request up to " + A.TOTAL + " items a month.", ["limits", {}]); },
    logout: () => { S.loggedIn = false; S.guest = false; save(); reset([["welcome"]]); },
    fav: (t) => {
      const id = t.dataset.id, i = S.favs.indexOf(id);
      if (i > -1) S.favs.splice(i, 1); else S.favs.push(id);
      save();
      $$('.heart[data-id="' + id + '"]', appEl).forEach((h) => { h.classList.toggle("on", i < 0); if (i < 0) { h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); } });
      toast(i > -1 ? "Removed from saved items" : "Saved");
    },
    loc: () => openSheet('<h3 class="sh-t">Your neighborhood</h3><div class="opts">' + A.HOODS.map((h) => '<button class="opt' + (S.hood === h ? " on" : "") + '" data-act="setHood" data-h="' + h + '"><span class="radio"></span><span><b>' + h + "</b><span>Istanbul</span></span></button>").join("") + "</div>"),
    setHood: (t) => { S.hood = t.dataset.h; save(); closeSheet(); refresh(); toast("Showing donations near " + S.hood); },
    closeSheet: closeSheet,
    cat: (t) => { ui.cats = [t.dataset.cat]; ui.exMode = "list"; tab("explore"); },
    filters: filterSheet,
    fCat: (t) => { const c = t.dataset.cat, i = ui.cats.indexOf(c); if (i > -1) ui.cats.splice(i, 1); else ui.cats.push(c); t.classList.toggle("on", i < 0); },
    fKm: (t) => { ui.maxKm = Number(t.dataset.km); $$('[data-act="fKm"]', $("#sheetPanel")).forEach((b) => b.classList.toggle("on", b === t)); },
    fEss: (t) => { ui.ess = !ui.ess; t.classList.toggle("on", ui.ess); t.setAttribute("aria-checked", ui.ess); },
    fApply: () => { closeSheet(); updateExplore(); },
    fClear: () => { ui.cats = []; ui.maxKm = 0; ui.ess = false; ui.q = ""; closeSheet(); updateExplore(); },
    fRemove: (t) => { ui.cats = ui.cats.filter((c) => c !== t.dataset.cat); updateExplore(); },
    exMode: (t) => { ui.exMode = t.dataset.m; $$("#exSeg button", current).forEach((b) => b.classList.toggle("on", b === t)); $("#exMain", current).innerHTML = exMain(); },
    pin: (t) => { ui.sel = t.dataset.id; $("#exMain", current).innerHTML = exMain(); },
    pickup: (t) => { ui.pickup = Number(t.dataset.i); $$(".opt", current).forEach((o) => o.classList.toggle("on", o === t)); },
    priv: (t) => { ui.priv = !ui.priv; t.classList.toggle("on", ui.priv); t.setAttribute("aria-checked", ui.priv); },
    privDefault: (t) => { S.privateDefault = !S.privateDefault; ui.priv = S.privateDefault; save(); t.classList.toggle("on", S.privateDefault); t.setAttribute("aria-checked", S.privateDefault); },
    confirmReq: (t) => {
      const it = itemById(t.dataset.id), c = check(it);
      if (!c.ok) { toast(c.msg); return; }
      const msg = $("#reqMsg") ? $("#reqMsg").value.trim() : "";
      const r = { id: "r" + Date.now().toString(36), item: it.id, status: "pending", when: "Today", private: ui.priv, point: ui.pickup === 0 ? pointFor(it) : "Meet the donor nearby", code: "AS-" + (1000 + Math.floor(Math.random() * 9000)), note: msg };
      S.requests.unshift(r); save();
      stack.pop(); go("requested", { rid: r.id });
      scheduleAccept(r.id);
    },
    trackReq: () => { ui.trackTab = "req"; if (top().id === "tracking") refresh(); else go("tracking"); },
    trackDon: (t) => { ui.trackTab = "don"; if (t && t.dataset && t.dataset.id) ui.donSel = t.dataset.id; if (top().id === "tracking") refresh(); else go("tracking"); },
    trackMine: (t) => { const d = S.donations.find((x) => x.item === t.dataset.id); ui.trackTab = "don"; ui.donSel = d ? d.id : null; go("tracking"); },
    tTab: (t) => { ui.trackTab = t.dataset.t; refresh(); },
    donSel: (t) => { ui.donSel = t.dataset.id; refresh(); },
    advance: (t) => {
      const d = S.donations.find((x) => x.id === t.dataset.id); if (!d || d.step >= 4) return;
      d.step++; d.times[d.step - 1] = stamp(); if (d.step >= 2 && !d.to) d.to = "Caferağa"; save(); refresh();
      if (d.step === 4) toast("Delivered. Thank you for sharing!");
    },
    cancelReq: (t) => { const r = S.requests.find((x) => x.id === t.dataset.id); if (!r) return; r.status = "cancelled"; save(); refresh(); toast("Request cancelled. One active slot is free again."); },
    donateTab: () => { ui.draft = ui.draft || newDraft(); go("donate", {}, "up"); },
    pickPhoto: () => { const i = $("#photoIn"); if (i) i.click(); },
    samplePhoto: () => { const d = ui.draft; if (!d.cat) d.cat = "clothing"; d.art = A.CAT_ART[d.cat]; d.photo = null; if (!d.title) d.title = d.cat === "clothing" ? "Knit Sweater" : ""; refresh(); },
    dCat: (t) => { const d = ui.draft; d.cat = t.dataset.cat; if (d.art) d.art = A.CAT_ART[d.cat]; d.err = ""; refresh(); },
    dPick: (t) => {
      const d = ui.draft, k = t.dataset.k, v = t.dataset.v;
      if (t.dataset.multi) { const i = d[k].indexOf(v); if (i > -1) d[k].splice(i, 1); else d[k].push(v); t.classList.toggle("on", i < 0); }
      else { d[k] = v; $$('[data-k="' + k + '"]', current).forEach((b) => b.classList.toggle("on", b === t)); }
    },
    dPickup: (t) => { ui.draft.pickup = Number(t.dataset.i); $$(".opt", current).forEach((o) => o.classList.toggle("on", o === t)); },
    dNext: () => {
      const d = ui.draft;
      if (d.step === 1) {
        if (!d.cat || !d.title.trim()) { d.err = !d.cat ? "Choose a category." : "Add a title so neighbors know what it is."; refresh(); return; }
        if (!d.photo && !d.art) d.art = A.CAT_ART[d.cat];
      }
      d.err = ""; d.step = Math.min(3, d.step + 1); refresh(); const b = $(".body", current); if (b) b.scrollTop = 0;
    },
    dPrev: () => { ui.draft.step = Math.max(1, ui.draft.step - 1); refresh(); },
    publish: () => {
      const d = ui.draft, id = "my" + Date.now().toString(36);
      const it = { id: id, mine: true, title: d.title.trim(), cat: d.cat, art: d.art || A.CAT_ART[d.cat], photo: d.photo, hood: d.hood, km: 0.1, donor: "me", posted: "Just now", cond: d.cond, qty: d.qty, desc: d.desc.trim() || "No description added.", pickup: PICKUPS[d.pickup], x: 176, y: 358 };
      S.myItems.unshift(it);
      const don = { id: "d" + Date.now().toString(36), item: id, title: it.title, cat: it.cat, art: it.art, step: 1, times: [stamp()] };
      S.donations.unshift(don); save();
      ui.draft = null; ui.donSel = don.id;
      stack = [{ id: "home", p: {} }, { id: "donated", p: { did: don.id } }];
      show("fade");
      scheduleMatch(don.id);
    },
    quick: (t) => sendMsg(top().p.t, t.dataset.q),
    readAll: () => { S.notifs.forEach((n) => { n.unread = false; }); save(); refresh(); },
    openNotif: (t) => { const n = S.notifs.find((x) => x.id === t.dataset.id); if (!n) return; n.unread = false; save(); go(n.go[0], n.go[1]); },
  };

  /* ---------- Input ---------- */
  let flashT;
  appEl.addEventListener("click", (e) => {
    const t = e.target.closest("[data-go],[data-back],[data-tab],[data-act]");
    if (!t || !appEl.contains(t)) {
      if (!e.target.closest("input,textarea,select,label,a")) { appEl.classList.add("flash"); clearTimeout(flashT); flashT = setTimeout(() => appEl.classList.remove("flash"), 650); }
      return;
    }
    if (t.disabled) return;
    if (t.hasAttribute("data-back")) return back();
    if (t.dataset.act) return ACT[t.dataset.act] && ACT[t.dataset.act](t, e);
    if (t.dataset.tab) return tab(t.dataset.tab);
    if (t.dataset.go) { if (t.dataset.go === "explore" && t.classList.contains("slide")) return tab("explore"); return go(t.dataset.go, t.dataset.p ? JSON.parse(t.dataset.p) : {}); }
  });

  /* ---------- Jump to any screen (navigator, deep links) ---------- */
  function jump(id, mode) {
    if (!R[id]) id = "welcome";
    const onboarding = ["welcome", "login", "signup", "verify"].indexOf(id) > -1;
    if (!onboarding && !S.loggedIn && !S.guest) { S.loggedIn = true; save(); }
    if (onboarding && id !== "welcome") ui.verifyStage = id === "verify" ? 1 : ui.verifyStage;
    const req = firstRequestable();
    const lastReq = S.requests.find((r) => r.item) || S.requests[0];
    const map = {
      welcome: [["welcome"]], login: [["welcome"], ["login"]], signup: [["welcome"], ["signup"]], verify: [["welcome"], ["signup"], ["verify"]],
      home: [["home"]], explore: [["explore"]], item: [["home"], ["item", { id: "sweater" }]],
      request: [["home"], ["item", { id: req.id }], ["request", { id: req.id }]], requested: [["home"], ["requested", { rid: lastReq.id }]],
      donate: [["home"], ["donate", {}, true]], donated: [["home"], ["donated", { did: S.donations[0].id }]],
      tracking: [["profile"], ["tracking"]], messages: [["messages"]], chat: [["messages"], ["chat", { t: "t1" }]],
      profile: [["profile"]], limits: [["profile"], ["limits"]], notifications: [["home"], ["notifications"]],
    };
    if (id === "donate" && !ui.draft) ui.draft = newDraft();
    reset(map[id], mode || "fade");
  }
  function resetDemo() { LS.del(KEY); S = freshState(); ui = freshUI(); jump(top() ? top().id : "welcome"); toast("Demo data reset"); }

  // resume pending simulations after a reload
  S.requests.forEach((r) => { if (r.status === "pending") scheduleAccept(r.id); });
  S.donations.forEach((d) => { if (d.step === 1) scheduleMatch(d.id); });

  window.Proto = { jump: jump, resetDemo: resetDemo, current: () => (top() ? top().id : null), back: back };

  /* ======================================================================
     PRESENTER SHELL (navigator, caption, scaling, present mode, hints)
     ====================================================================== */
  const SCREENS = A.SCREENS, order = SCREENS.map((s) => s.id);
  const num = (id) => String(order.indexOf(id) + 1).padStart(2, "0");
  const body = document.body;

  function buildNav() {
    const html = A.GROUPS.map((g, gi) => '<div class="nav-g"><h4>' + g + "</h4>" + SCREENS.filter((s) => s.group === gi).map((s) => '<button data-jump="' + s.id + '"><span class="n">' + num(s.id) + "</span><span>" + s.title + "</span></button>").join("") + "</div>").join("");
    $$(".screen-nav").forEach((n) => { n.innerHTML = html; });
  }
  document.addEventListener("click", (e) => {
    const j = e.target.closest("[data-jump]");
    if (j) { jump(j.dataset.jump); body.classList.remove("drawer-open"); }
  });
  function onScreen(id) {
    const s = SCREENS.find((x) => x.id === id); if (!s) return;
    $$("[data-jump]").forEach((b) => b.classList.toggle("on", b.dataset.jump === id));
    const cap = $("#caption");
    if (cap) cap.innerHTML = '<button class="cap-arrow" data-step="-1" aria-label="Previous screen">' + ic("chev-l") + '</button><div class="cap-t"><b><span class="cap-n">' + num(id) + ".</span> " + s.title + '</b><span>(' + s.sub + ')</span><p class="cap-what">' + s.what + '</p></div><button class="cap-arrow" data-step="1" aria-label="Next screen">' + ic("chev-r") + "</button>";
    try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ }
  }
  window.addEventListener("proto:screen", (e) => onScreen(e.detail.id));
  function step(d) { const i = order.indexOf(top().id); const n = order[Math.max(0, Math.min(order.length - 1, i + d))]; if (n !== top().id) jump(n, "fade"); }
  document.addEventListener("click", (e) => { const s = e.target.closest("[data-step]"); if (s) step(Number(s.dataset.step)); });

  function fit() {
    const wrap = $("#phoneWrap"); if (!wrap) return;
    if (body.classList.contains("mobile")) { wrap.style.removeProperty("--s"); return; }
    const stage = $(".stage"), cap = $("#caption");
    const h = stage.clientHeight - (cap ? cap.offsetHeight : 0) - 48, w = stage.clientWidth - 40;
    const s = Math.max(0.42, Math.min(body.classList.contains("present") ? 1.25 : 1, h / 872, w / 418));
    wrap.style.setProperty("--s", s.toFixed(3));
  }
  const mq = window.matchMedia("(max-width: 760px)");
  function setMobile() { body.classList.toggle("mobile", mq.matches); fit(); }
  if (mq.addEventListener) mq.addEventListener("change", setMobile); else mq.addListener(setMobile);
  window.addEventListener("resize", fit);

  function setHints(on) { appEl.classList.toggle("hints", on); $$('[data-ctl="hints"]').forEach((b) => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); }); }
  function setPresent(on) {
    body.classList.toggle("present", on);
    $$('[data-ctl="present"]').forEach((b) => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    try { if (on && document.documentElement.requestFullscreen && !document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); if (!on && document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) { /* optional */ }
    setTimeout(fit, 60);
  }
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && body.classList.contains("present")) setPresent(false); setTimeout(fit, 60); });
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-ctl]"); if (!c) return;
    const k = c.dataset.ctl;
    if (k === "hints") setHints(!appEl.classList.contains("hints"));
    if (k === "present") setPresent(!body.classList.contains("present"));
    if (k === "reset") resetDemo();
    if (k === "drawer") body.classList.toggle("drawer-open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input,textarea,select,[contenteditable]")) return;
    if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
    else if (e.key === "Escape") { if ($("#sheet").classList.contains("show")) closeSheet(); else if (body.classList.contains("present")) setPresent(false); else body.classList.remove("drawer-open"); }
    else if (e.key === "h" || e.key === "H") setHints(!appEl.classList.contains("hints"));
    else if (e.key === "p" || e.key === "P") setPresent(!body.classList.contains("present"));
  });
  window.addEventListener("hashchange", () => { const id = location.hash.slice(1); if (R[id] && id !== top().id) jump(id); });

  /* ---------- Boot ---------- */
  buildNav();
  setMobile();
  const start = location.hash.slice(1);
  jump(R[start] ? start : "welcome", "none");
  fit();
  setTimeout(fit, 300);
})();
