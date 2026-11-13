/* 공통 도구: 설정 읽기, 금액 표기, 연락처 링크, 유입 경로(ref·utm), 백엔드 전송 */
(function () {
  var C = window.SITE_CONFIG || {};
  var HC = (window.HC = {});
  HC.C = C;

  /* 설정값 경로로 읽기: "BENEFIT.NOW_CASH" */
  HC.get = function (path) {
    return String(path)
      .split(".")
      .reduce(function (o, k) {
        return o == null ? undefined : o[k];
      }, C);
  };

  /* 자리 표시 값 판별 (OOO, 010-0000-0000, 빈칸) */
  HC.isBlank = function (v) {
    if (v == null) return true;
    var s = String(v).trim();
    return !s || /OOO|0000-0000|^-+$/.test(s);
  };

  /* 원 단위 숫자 → 만원 단위 한글 표기 */
  HC.won = function (n) {
    n = Number(n);
    if (!isFinite(n)) n = 0;
    var neg = n < 0;
    n = Math.abs(n);
    var man = Math.round(n / 10000);
    if (man === 0) return "0원";
    var eok = Math.floor(man / 10000),
      rest = man % 10000;
    var s;
    if (eok > 0)
      s =
        eok +
        "억" +
        (rest ? " " + rest.toLocaleString("ko-KR") + "만원" : "원");
    else s = rest.toLocaleString("ko-KR") + "만원";
    return (neg ? "-" : "") + s;
  };
  HC.comma = function (n) {
    n = Number(n);
    return isFinite(n) ? Math.round(n).toLocaleString("ko-KR") : "0";
  };

  /* 숫자 입력 정리: 숫자 아닌 것 제거, 빈칸·이상한 값은 기본값 */
  HC.num = function (v, def, min, max) {
    var s = String(v == null ? "" : v).replace(/[^\d.]/g, "");
    var parts = s.split(".");
    if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
    var n = parseFloat(s);
    if (!isFinite(n)) n = def;
    if (min != null && n < min) n = min;
    if (max != null && n > max) n = max;
    return n;
  };

  /* 상담사 연락처 */
  var cs = C.CONSULTANT || {};
  /* 전화번호는 화면에 노출하지 않는다 — 모든 문의는 먼저 시트에 기록된 뒤 상담사에게 넘어간다 (11/11 결정) */
  HC.phone = "";
  HC.phoneLabel = HC.isBlank(cs.NAME) ? "담당 상담사" : cs.NAME;
  HC.consultantLabel = HC.isBlank(cs.NAME) ? "담당 상담사" : cs.NAME;
  HC.kakao = HC.isBlank(cs.KAKAO_URL) ? "" : cs.KAKAO_URL;
  HC.telHref = "#callback";

  /* 전화 상담 요청 창: 이름·번호를 남기면 시트에 기록되고 상담사가 전화한다 */
  HC.openCallback = function () {
    var box = document.getElementById("cbModal");
    if (!box) {
      box = document.createElement("div");
      box.id = "cbModal";
      box.className = "cb-modal";
      box.setAttribute("role", "dialog");
      box.setAttribute("aria-label", "전화 상담 요청");
      box.innerHTML =
        '<div class="cb-card"><button type="button" class="cb-x" aria-label="닫기">×</button>' +
        '<p class="eyebrow">Call request</p><h3>전화 상담 요청</h3>' +
        '<p class="cb-lead">번호를 남겨 주시면 상담사가 바로 전화드립니다.</p>' +
        '<form id="cbForm" novalidate>' +
        '<div class="field"><label for="cbName">이름</label><input id="cbName" autocomplete="name" maxlength="20" placeholder="홍길동"></div>' +
        '<div class="field"><label for="cbPhone">휴대폰 번호</label><input id="cbPhone" inputmode="tel" autocomplete="tel" maxlength="13" placeholder="010-1234-5678"></div>' +
        '<label class="agree"><input type="checkbox" id="cbAgree"><span>개인정보 수집·이용에 동의합니다 (필수) — 이름·번호, 분양 상담 목적, 상담 종료 후 1년 보관</span></label>' +
        '<p class="err" id="cbErr"></p>' +
        '<button type="submit" class="btn btn-point" id="cbSubmit">전화 요청하기</button></form>' +
        '<div class="cb-done" id="cbDone" hidden><h3>요청이 접수되었습니다</h3><p>상담사가 곧 전화드립니다.</p></div></div>';
      document.body.appendChild(box);
      var close = function () {
        box.classList.remove("open");
      };
      box.addEventListener("click", function (e) {
        if (e.target === box) close();
      });
      box.querySelector(".cb-x").addEventListener("click", close);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
      var ph = box.querySelector("#cbPhone");
      ph.addEventListener("input", function () {
        var v = this.value.replace(/\D/g, "").slice(0, 11);
        this.value =
          v.length > 7
            ? v.slice(0, 3) + "-" + v.slice(3, v.length - 4) + "-" + v.slice(-4)
            : v.length > 3
              ? v.slice(0, 3) + "-" + v.slice(3)
              : v;
      });
      var busy = false;
      box.querySelector("#cbForm").addEventListener("submit", function (e) {
        e.preventDefault();
        if (busy) return;
        var name = box.querySelector("#cbName").value.trim(),
          phone = HC.normPhone(ph.value),
          err = box.querySelector("#cbErr");
        if (name.length < 2) {
          err.textContent = "이름을 2글자 이상 입력해 주세요.";
          return;
        }
        if (!phone) {
          err.textContent =
            "010으로 시작하는 휴대폰 번호를 정확히 입력해 주세요.";
          return;
        }
        if (!box.querySelector("#cbAgree").checked) {
          err.textContent = "개인정보 수집·이용에 동의해 주세요.";
          return;
        }
        err.textContent = "";
        busy = true;
        var b = box.querySelector("#cbSubmit");
        b.disabled = true;
        b.textContent = "보내는 중...";
        HC.send({
          type: "lead",
          channel: "callback",
          name: name,
          phone: phone,
          visitDate: "",
          unitType: "",
          message: "전화 상담 요청",
        }).then(function () {
          box.querySelector("#cbForm").hidden = true;
          box.querySelector("#cbDone").hidden = false;
        });
      });
    }
    box.classList.add("open");
    setTimeout(function () {
      var n = box.querySelector("#cbName");
      if (n && !box.querySelector("#cbForm").hidden) n.focus();
    }, 50);
  };

  /* 휴대폰 번호 검사·정리 */
  HC.normPhone = function (v) {
    var d = String(v || "").replace(/\D/g, "");
    if (!/^01[016789]\d{7,8}$/.test(d)) return "";
    return d.length === 11
      ? d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7)
      : d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
  };

  /* 저장소 (사생활 보호 모드에서도 오류 없게) */
  HC.store = {
    get: function (k, def) {
      try {
        var v = localStorage.getItem(k);
        return v == null ? def : JSON.parse(v);
      } catch (e) {
        return def;
      }
    },
    set: function (k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /* ?ref=코드 · utm 저장 (30일) */
  var DAY = 86400000;
  (function captureSource() {
    var q;
    try {
      q = new URLSearchParams(location.search);
    } catch (e) {
      return;
    }
    var ref = (q.get("ref") || "")
      .trim()
      .replace(/[^\w-]/g, "")
      .slice(0, 20);
    if (ref) HC.store.set("hc_ref", { code: ref, exp: Date.now() + 30 * DAY });
    var us = q.get("utm_source"),
      uc = q.get("utm_campaign"),
      um = q.get("utm_medium");
    if (us || uc)
      HC.store.set("hc_utm", {
        source: (us || "").slice(0, 60),
        campaign: (uc || "").slice(0, 80),
        medium: (um || "").slice(0, 60),
        exp: Date.now() + 30 * DAY,
      });
  })();
  HC.source = function () {
    var r = HC.store.get("hc_ref", null),
      u = HC.store.get("hc_utm", null),
      now = Date.now();
    if (r && r.exp < now) r = null;
    if (u && u.exp < now) u = null;
    return {
      ref: r ? r.code : "",
      utm_source: u ? u.source : "",
      utm_campaign: u ? u.campaign : "",
      utm_medium: u ? u.medium : "",
      page: location.pathname.split("/").pop() || "index.html",
      referrer: (document.referrer || "").slice(0, 200),
    };
  };

  HC.testMode = !String(C.APPS_SCRIPT_URL || "").trim();

  /* 백엔드 전송: Apps Script 주소가 있으면 text/plain POST (CORS 사전요청 없음), 없으면 이 기기에 저장 */
  HC.send = function (payload) {
    var data = Object.assign(
      { time: new Date().toISOString() },
      HC.source(),
      payload,
    );
    var key = data.type === "referrer" ? "hc_referrers" : "hc_leads";
    function local() {
      var list = HC.store.get(key, []);
      if (!Array.isArray(list)) list = [];
      list.push(data);
      HC.store.set(key, list);
    }
    if (HC.testMode) {
      local();
      return Promise.resolve({ ok: true, test: true });
    }
    var url = String(C.APPS_SCRIPT_URL).trim();
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: true };
        });
      })
      .catch(function () {
        /* 응답을 못 읽는 환경 대비: no-cors 로 한 번 더 보내고, 이 기기에도 백업 */
        local();
        return fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(data),
        })
          .then(function () {
            return { ok: true, opaque: true };
          })
          .catch(function () {
            return { ok: false, saved: true };
          });
      });
  };

  /* 안내 토스트 */
  HC.toast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(HC._tt);
    HC._tt = setTimeout(function () {
      t.classList.remove("show");
    }, 2200);
  };

  /* 복사 (구형 브라우저 대비) */
  HC.copy = function (text) {
    if (navigator.clipboard && window.isSecureContext)
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }, fallback);
    return Promise.resolve(fallback());
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      return ok;
    }
  };

  /* 화면에 설정값·연락처 채우기 */
  HC.bindPage = function () {
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      var k = el.getAttribute("data-bind"),
        v;
      if (k === "CONSULTANT_LABEL") v = HC.consultantLabel;
      else if (k === "PHONE_TEXT") v = HC.phone;
      else v = HC.get(k);
      if (v != null && v !== "") el.textContent = v;
    });
    document.querySelectorAll("[data-money]").forEach(function (el) {
      var v = Number(HC.get(el.getAttribute("data-money")));
      if (!isFinite(v)) return;
      el.textContent =
        el.getAttribute("data-unit") === "man"
          ? HC.comma(v / 10000)
          : HC.won(v);
    });
    document.querySelectorAll("[data-tel]").forEach(function (a) {
      a.href = "#callback";
      a.addEventListener("click", function (e) {
        e.preventDefault();
        HC.openCallback();
      });
    });
    document.querySelectorAll("[data-kakao]").forEach(function (a) {
      if (HC.kakao) {
        a.href = HC.kakao;
        a.target = "_blank";
        a.rel = "noopener";
      } else if (a.classList.contains("kakao")) {
        /* 카톡 채널이 없으면 하단 버튼은 채팅 상담(챗봇)으로 */
        a.classList.remove("kakao");
        a.classList.add("sms");
        a.href = "#chat";
        a.lastChild.textContent = "채팅 상담";
        a.addEventListener("click", function (e) {
          e.preventDefault();
          var f = document.getElementById("chatFab");
          if (f) f.click();
        });
      } else {
        a.style.display = "none";
      }
    });
    if (location.hash === "#callback") HC.openCallback();
  };
})();
