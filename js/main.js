/* 랜딩 v3 화면 동작
   상단 바 · 지도/배치도 탭 · 평면 탭 · 크게 보기 · 영상 · 갤러리 · 잔여 현황판 · FAQ · 첫 방문 팝업 · 숫자 올라가기 · 관심고객 폼
   (문구 규칙: ../COPY_RULES.md — 금액표·비교 계산기 없음) */
(function () {
  var HC = window.HC, C = HC.C;
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  HC.bindPage();

  /* ---------- 상단 바: 히어로 지나면 흰 바탕 ---------- */
  var top = document.querySelector(".top");
  function onScroll() { top.classList.toggle("solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 탭 공통 ---------- */
  function tabs(id, fn) {
    var box = $(id); if (!box) return;
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      box.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
      fn(b);
    });
  }
  function swapImg(img, frame, src, cap, alt) {
    img.style.opacity = "0";
    var n = new Image();
    n.onload = n.onerror = function () { img.src = src; img.alt = alt || cap; img.style.opacity = "1"; };
    n.src = src;
    frame.setAttribute("data-lb", src); frame.setAttribute("data-cap", cap);
  }
  tabs("mapTabs", function (b) { swapImg($("mapImg"), $("mapFrame"), b.getAttribute("data-src"), b.getAttribute("data-cap"), "회천지구 " + b.getAttribute("data-cap")); });
  tabs("cxTabs", function (b) { swapImg($("cxImg"), $("cxFrame"), b.getAttribute("data-src"), b.getAttribute("data-cap")); });

  /* ---------- 평면 ---------- */
  var planType = "84A";
  function renderPlan(type) {
    planType = type;
    var info = ((C.COMPLEX || {}).TYPES || {})[type] || {};
    var src = "assets/v3/plan-" + type.toLowerCase() + ".webp";
    swapImg($("planImg"), $("planStage"), src, type + " 3D 평면", type + " 3D 평면도");
    $("planLetter").textContent = type.slice(2);
    $("planDesc").textContent = type === "84A"
      ? "남향 중심 4Bay 판상형. 옵션 선택 시 와이드 주방으로 넓게 쓸 수 있습니다."
      : "전 세대 84㎡의 또 다른 선택. 드레스룸과 팬트리를 갖춘 구조입니다.";
    var unit = function (v) { var m = String(v || "-").match(/^([\d.]+)\s*(.*)$/); return m ? "<b class='num'>" + m[1] + "</b> " + m[2] : String(v || "-"); };
    $("planSpecs").innerHTML = [["전용면적", unit(info.exclusive)], ["공급면적", unit(info.supply)], ["서비스면적", unit(info.service)], ["공급 세대", "<b class='num'>" + (info.count || "-") + "</b> 세대"]]
      .map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td></tr>"; }).join("");
    $("planCta").textContent = type + " 관심 타입 상담";
  }
  tabs("planTabs", function (b) { renderPlan(b.getAttribute("data-t")); });
  renderPlan("84A");
  $("planCta").addEventListener("click", function () {
    $("fType").value = planType;
    HC.toast(planType + " 타입으로 상담 신청을 준비했어요");
    $("apply").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- 크게 보기 (지도·평면·조감도·사진·영상) ---------- */
  var lb = $("lb"), stage = $("lbStage");
  function openLb(src, cap, isVideo) {
    stage.innerHTML = "";
    var el;
    if (isVideo) {
      el = document.createElement("video");
      el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true; el.muted = true;
    } else {
      el = document.createElement("img");
      el.src = src; el.alt = cap || "";
      el.addEventListener("click", function () { el.classList.toggle("big"); });
    }
    stage.appendChild(el);
    $("lbCap").textContent = cap || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLb() { lb.hidden = true; stage.innerHTML = ""; document.body.style.overflow = ""; }
  HC.openLb = openLb;
  document.addEventListener("click", function (e) {
    var z = e.target.closest(".zoomable");
    if (z && z.getAttribute("data-lb")) { e.preventDefault(); openLb(z.getAttribute("data-lb"), z.getAttribute("data-cap")); }
  });
  $("lbClose").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target === stage) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (!lb.hidden) closeLb(); if (!$("pop").hidden) closePop(); } });

  /* ---------- 영상 배너: 화면에 보일 때만 소리 없이 재생, 버튼은 크게 보기 ---------- */
  var film = $("filmBg");
  if (film && "IntersectionObserver" in window && !reduce) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { if (film.preload === "none") { film.preload = "auto"; } var p = film.play(); if (p && p.catch) p.catch(function () {}); }
        else film.pause();
      });
    }, { threshold: 0.25 }).observe(film);
  }
  $("filmPlay").addEventListener("click", function () { if (film) film.pause(); openLb("assets/v3/film.mp4", "단지 CG 영상 (이해를 돕기 위한 것으로 실제와 차이가 있을 수 있습니다)", true); });

  /* ---------- 숫자 올라가기 (값은 처음부터 보이고, 보일 때 한 번 다시 셈) ---------- */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target, to = +el.getAttribute("data-count"); if (!to) return;
        var t0 = performance.now(), d = 1300;
        (function step(t) {
          var k = Math.min(1, (t - t0) / d), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = v; if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { io.observe(el); });
  }

  /* ---------- 사진 살짝 움직이기 (패럴랙스) ---------- */
  var px = Array.prototype.slice.call(document.querySelectorAll(".parallax img"));
  if (px.length && !reduce) {
    var ticking = false;
    var run = function () {
      ticking = false;
      var vh = window.innerHeight;
      px.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var p = (r.top + r.height / 2 - vh / 2) / vh; // -1 ~ 1
        img.style.transform = "translateY(" + (-7 - p * 6).toFixed(2) + "%)";
      });
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
    run();
  }

  /* ---------- 갤러리: 손가락 밀기 + PC 마우스 끌기 + 화살표 ---------- */
  (function () {
    var tr = $("gtrack"); if (!tr) return;
    var figs = tr.querySelectorAll("figure"), n = figs.length;
    function idx() {
      var c = tr.scrollLeft + tr.clientWidth / 2, best = 0, bd = 1e9;
      figs.forEach(function (f, i) { var m = f.offsetLeft + f.offsetWidth / 2, d = Math.abs(m - c); if (d < bd) { bd = d; best = i; } });
      return best;
    }
    function go(i) { i = Math.max(0, Math.min(n - 1, i)); var f = figs[i]; tr.scrollTo({ left: f.offsetLeft - (tr.clientWidth - f.offsetWidth) / 2, behavior: "smooth" }); }
    function upd() { $("gCount").textContent = (idx() + 1) + " / " + n; }
    tr.addEventListener("scroll", function () { clearTimeout(tr._t); tr._t = setTimeout(upd, 60); }, { passive: true });
    $("gPrev").onclick = function () { go(idx() - 1); };
    $("gNext").onclick = function () { go(idx() + 1); };
    var down = false, sx = 0, sl = 0;
    tr.addEventListener("mousedown", function (e) { down = true; sx = e.pageX; sl = tr.scrollLeft; tr.classList.add("drag"); e.preventDefault(); });
    window.addEventListener("mousemove", function (e) { if (!down) return; tr.scrollLeft = sl - (e.pageX - sx); });
    window.addEventListener("mouseup", function () { if (!down) return; down = false; tr.classList.remove("drag"); go(idx()); });
    upd();
  })();

  /* ---------- 동·호 잔여 현황판 (시트 → 없으면 data/units.json) ---------- */
  var UNITS = [], curDong = "";
  var isSold = function (s) { return /계약|완료|sold|판매|마감|x/i.test(String(s || "")); };
  function loadUnits() {
    var url = String(C.APPS_SCRIPT_URL || "").trim();
    var fromSheet = url ? fetch(url + (url.indexOf("?") < 0 ? "?" : "&") + "action=units").then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !Array.isArray(j.units) || !j.units.length) throw new Error("empty");
      j.live = true; return j;
    }) : Promise.reject(new Error("no url"));
    return fromSheet.catch(function () { return fetch("data/units.json").then(function (r) { return r.json(); }).then(function (j) { j.live = false; return j; }); });
  }
  loadUnits().then(function (j) {
    UNITS = (j.units || []).map(function (u) {
      var ho = String(u.ho || "").replace(/\D/g, "");
      return { dong: String(u.dong || "").replace(/\D/g, ""), ho: ho, floor: Math.floor(+ho / 100), line: +ho % 100, type: String(u.type || "84A").toUpperCase().replace("㎡", ""), sold: isSold(u.status) };
    }).filter(function (u) { return u.dong && u.floor > 0 && u.line > 0; });
    if (j.live) { var el = $("unitsLive"); el.hidden = false; el.textContent = "실시간 반영 중" + (j.updated ? " · " + j.updated : ""); }
    renderUnits();
  }).catch(function () { $("board").innerHTML = "<p style='text-align:center;padding:20px'>현황을 불러오지 못했습니다. 상담사에게 문의해 주세요.</p>"; });

  function renderUnits() {
    var left = UNITS.filter(function (u) { return !u.sold; });
    var cnt = function (f) { return left.filter(f).length; };
    $("unitsSum").innerHTML = [
      ["84A 잔여", cnt(function (u) { return u.type === "84A"; })], ["전체 세대", "<small>총 </small>" + UNITS.length + "<small>세대</small>"],
      ["84B 잔여", cnt(function (u) { return u.type === "84B"; })], ["10층 이상 잔여", cnt(function (u) { return u.floor >= 10; })],
    ].map(function (x) { return "<div><b class='num'>" + x[1] + "</b><span>" + x[0] + "</span></div>"; }).join("");
    var dongs = Array.from(new Set(UNITS.map(function (u) { return u.dong; }))).sort();
    if (!curDong || dongs.indexOf(curDong) < 0) curDong = dongs[0];
    $("dongTabs").innerHTML = dongs.map(function (d) {
      var c = left.filter(function (u) { return u.dong === d; }).length;
      return "<button type='button' data-d='" + d + "' class='" + (d === curDong ? "on" : "") + "'>" + d + "동<em>잔여 " + c + "</em></button>";
    }).join("");
    drawBoard();
  }
  $("dongTabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    curDong = b.getAttribute("data-d"); renderUnits();
  });
  function drawBoard() {
    var us = UNITS.filter(function (u) { return u.dong === curDong; });
    var maxL = Math.max.apply(null, us.map(function (u) { return u.line; }).concat([1]));
    var maxF = Math.max.apply(null, us.map(function (u) { return u.floor; }).concat([1]));
    var map = {}; us.forEach(function (u) { map[u.floor + "-" + u.line] = u; });
    var left = us.filter(function (u) { return !u.sold; }).length;
    var h = "<div class='bhead'><h3>" + curDong + "동</h3><span>남은 세대 <b class='num'>" + left + "</b> / " + us.length + "</span></div>";
    h += "<div class='grid-u num' style='grid-template-columns:30px repeat(" + maxL + ",1fr)'>";
    for (var f = maxF; f >= 1; f--) {
      h += "<div class='fl'>" + f + "F</div>";
      for (var l = 1; l <= maxL; l++) {
        var u = map[f + "-" + l];
        if (!u) h += "<span class='u none'></span>";
        else h += "<button type='button' class='u" + (u.type === "84B" ? " b" : "") + (u.sold ? " sold" : "") + "' data-k='" + f + "-" + l + "' title='" + u.dong + "동 " + u.ho + "호 " + u.type + (u.sold ? " 계약 완료" : "") + "'" + (u.sold ? " disabled" : "") + ">" + u.ho + "</button>";
      }
    }
    $("board").innerHTML = h + "</div>";
    $("board").onclick = function (e) {
      var b = e.target.closest("button.u"); if (!b || b.disabled) return;
      var u = map[b.getAttribute("data-k")]; if (!u) return;
      HC.pickedUnit = u.dong + "동 " + u.ho + "호 (" + u.type + ")";
      var ft = $("fType"); if (ft && (u.type === "84A" || u.type === "84B")) ft.value = u.type;
      var pk = $("pickedUnit"); pk.textContent = HC.pickedUnit; pk.hidden = false;
      HC.toast(u.dong + "동 " + u.ho + "호를 관심 호수로 담았어요");
      $("apply").scrollIntoView({ behavior: "smooth" });
    };
  }

  /* 모바일: 둥근 챗봇 버튼 대신 하단 바의 '채팅' */
  var dc = $("dockChat"); if (dc) dc.addEventListener("click", function () { $("chatFab").click(); });

  /* ---------- FAQ (data/faq.json 의 질문·답 사용) ---------- */
  var FAQ_ORDER = ["benefit", "movein", "traffic", "okjeong", "stage3", "school", "wait", "plan", "gift", "visit", "units", "life", "loan", "option"];
  fetch("data/faq.json").then(function (r) { return r.json(); }).then(function (d) {
    var B = C.BENEFIT || {}, CX = C.COMPLEX || {};
    var fill = function (s) { return String(s || "").replace(/\{(\w+)\}/g, function (m, k) { return ({ NOTE: B.NOTE || "", MOVE_IN: CX.MOVE_IN || "", COMPLEX: CX.NAME || "", NAME: HC.consultantLabel, PHONE: "" })[k] || ""; }); };
    var items = FAQ_ORDER.map(function (id) { return d.items.filter(function (x) { return x.id === id; })[0]; }).filter(Boolean);
    $("faqList").innerHTML = items.map(function (it, i) {
      return "<details" + (i === 0 ? " open" : "") + "><summary><span class='q num'>Q" + String(i + 1).padStart(2, "0") + "</span><span class='qt'></span><i aria-hidden='true'></i></summary><div class='a'></div></details>";
    }).join("");
    var ds = $("faqList").querySelectorAll("details");
    items.forEach(function (it, i) {
      ds[i].querySelector(".qt").textContent = it.quick;
      ds[i].querySelector(".a").textContent = fill(it.answer);
    });
  }).catch(function () { $("faq").hidden = true; });

  /* ---------- 첫 방문 팝업 (오늘 하루 보지 않기) ---------- */
  var today = (function () { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); })();
  function closePop() { $("pop").hidden = true; document.body.style.overflow = ""; }
  HC.closePop = closePop;
  if (HC.store.get("hc_pop_hide", "") !== today) {
    setTimeout(function () { $("pop").hidden = false; }, 700);
  }
  $("popClose").addEventListener("click", closePop);
  $("popToday").addEventListener("click", function () { HC.store.set("hc_pop_hide", today); closePop(); });
  $("popGo").addEventListener("click", closePop);
  $("pop").addEventListener("click", function (e) { if (e.target === $("pop")) closePop(); });

  /* ---------- 관심고객 폼 ---------- */
  if (HC.testMode) $("testMode").hidden = false;
  try { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); $("fDate").min = d.toISOString().slice(0, 10); } catch (e) {}
  $("fPhone").addEventListener("input", function () {
    var v = this.value.replace(/\D/g, "").slice(0, 11);
    this.value = v.length > 7 ? v.slice(0, 3) + "-" + v.slice(3, v.length - 4) + "-" + v.slice(-4) : v.length > 3 ? v.slice(0, 3) + "-" + v.slice(3) : v;
  });
  var sending = false;
  $("leadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    sending = true; setTimeout(function () { sending = false; }, 3000);
    var name = $("fName").value.trim(), phone = HC.normPhone($("fPhone").value), ok = true;
    $("eName").textContent = name.length < 2 ? "이름을 2글자 이상 입력해 주세요." : "";
    $("ePhone").textContent = !phone ? "010으로 시작하는 휴대폰 번호를 정확히 입력해 주세요." : "";
    $("eAgree").textContent = !$("fAgree").checked ? "개인정보 수집·이용에 동의해 주세요." : "";
    if (name.length < 2 || !phone || !$("fAgree").checked) ok = false;
    if (!ok) return;
    var btn = $("fSubmit"); btn.disabled = true; btn.textContent = "보내는 중...";
    /* 시트 형식은 그대로: 관심 호수·문의 내용은 message 한 칸에 담는다 */
    var parts = [];
    if (HC.pickedUnit) parts.push("관심 호수: " + HC.pickedUnit);
    var memo = $("fMsg").value.trim().slice(0, 300);
    if (memo) parts.push("문의: " + memo);
    HC.send({ type: "lead", channel: "form", name: name, phone: phone, visitDate: $("fDate").value, unitType: $("fType").value, message: parts.join(" / ") }).then(function (res) {
      $("leadForm").hidden = true; $("testMode").hidden = true; $("thanks").hidden = false;
      $("thanksMsg").textContent = res && res.test ? "시험 모드라 이 기기에 저장되었습니다. 시트를 연결하면 상담사에게 바로 전달됩니다." : HC.consultantLabel + "가 곧 연락드립니다. 기다리기 어려우시면 바로 상담하세요.";
      $("formBox").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
})();
