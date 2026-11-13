/* 상담 챗봇: data/faq.json 키워드 매칭
   ※ 나중에 LLM(몰리)을 붙일 때는 아래 answer(question) 함수 하나만 바꾸면 됩니다.
     (예: fetch("몰리 API 주소", {body: question}) 결과를 {text, matched} 로 돌려주기) */
(function () {
  var HC = window.HC,
    C = HC.C;
  var $ = function (id) {
    return document.getElementById(id);
  };
  var FAQ = null,
    opened = false;

  /* 답변 안 {자리}를 설정값으로 채우기 */
  function fill(s, extra) {
    var B = C.BENEFIT || {};
    var map = {
      COMPLEX: (C.COMPLEX || {}).NAME || "",
      PHONE: HC.phone,
      NAME: HC.consultantLabel,
      MOVE_IN: (C.COMPLEX || {}).MOVE_IN || "",
      NOTE: B.NOTE || "",
    };
    Object.assign(map, extra || {});
    return String(s || "").replace(/\{(\w+)\}/g, function (m, k) {
      return map[k] != null ? map[k] : "";
    });
  }

  /* ===== 답 만들기 (LLM 교체 지점) ===== */
  function answer(question) {
    var q = String(question || "")
      .toLowerCase()
      .replace(/\s+/g, " ");
    if (!FAQ || !q.trim())
      return { text: fill(FAQ ? FAQ.fallback : ""), matched: false };
    var best = null,
      bestScore = 0;
    FAQ.items.forEach(function (it) {
      var score = 0;
      it.keys.forEach(function (k) {
        if (q.indexOf(String(k).toLowerCase()) >= 0)
          score += String(k).length >= 3 ? 2 : 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    });
    if (!best) return { text: fill(FAQ.fallback), matched: false };
    return { text: fill(best.answer), matched: true, id: best.id };
  }
  window.HC_CHAT_ANSWER = answer; // 시험·외부 연결용

  function add(text, who, links) {
    var d = document.createElement("div");
    d.className = "msg " + who;
    d.textContent = text;
    if (links) {
      var box = document.createElement("div");
      box.className = "links";
      var items = [
        ["상담 신청서", "#apply", ""],
        ["전화 상담 요청", "#callback", ""],
      ];
      if (HC.kakao) items.push(["카톡 상담", HC.kakao, "k"]);
      items.forEach(function (x) {
        var a = document.createElement("a");
        a.textContent = x[0];
        a.href = x[1];
        if (x[2]) a.className = x[2];
        if (x[1] === "#apply") a.addEventListener("click", close);
        if (x[1] === "#callback")
          a.addEventListener("click", function (e) {
            e.preventDefault();
            close();
            HC.openCallback();
          });
        if (/^https?:/.test(x[1])) {
          a.target = "_blank";
          a.rel = "noopener";
        }
        box.appendChild(a);
      });
      d.appendChild(box);
    }
    $("chatLog").appendChild(d);
    $("chatLog").scrollTop = $("chatLog").scrollHeight;
  }

  /* 대화 중 전화번호를 남기면 리드로 전송 */
  var history = [];
  function tryLead(text) {
    var m = text.match(/01[016789][\s.-]?\d{3,4}[\s.-]?\d{4}/);
    if (!m) return false;
    var phone = HC.normPhone(m[0]);
    if (!phone) return false;
    var rest = text
      .replace(m[0], " ")
      .replace(
        /(제\s*)?(이름은|이름|성함은|성함|입니다|이에요|예요|에요|번호|전화|연락처|주세요|부탁|드려요|요)/g,
        " ",
      );
    var nm = (rest.match(/[가-힣]{2,4}/) || [""])[0];
    HC.send({
      type: "lead",
      channel: "chatbot",
      name: nm || "(챗봇 고객)",
      phone: phone,
      visitDate: "",
      unitType: "",
      message: history.slice(-6).join(" / ").slice(0, 500),
    });
    add(
      fill(FAQ ? FAQ.leadThanks : "{NAME_LEAD}님, 연락처 잘 받았습니다.", {
        NAME_LEAD: nm || "고객",
      }) + (HC.testMode ? "\n(시험 모드: 이 기기에 저장됨)" : ""),
      "bot",
    );
    return true;
  }

  function ask(text) {
    text = String(text || "")
      .trim()
      .slice(0, 200);
    if (!text) return;
    add(text, "me");
    history.push(text);
    setTimeout(function () {
      if (tryLead(text)) return;
      var a = answer(text);
      add(a.text, "bot", !a.matched);
      if (
        a.matched &&
        (a.id === "visit" || a.id === "resale" || a.id === "loan" || a.id === "price" || a.id === "gift")
      )
        add(
          "이름과 전화번호를 여기 남겨 주셔도 상담사가 연락드려요.",
          "bot",
          true,
        );
    }, 250);
  }

  function open() {
    $("chat").classList.add("open");
    var dot = document.querySelector(".chat-fab .dot");
    if (dot) dot.remove();
    if (!opened) {
      opened = true;
      load().then(function () {
        add(fill(FAQ.greeting), "bot");
        $("chatQuick").innerHTML = "";
        FAQ.items
          .filter(function (i) {
            return i.quick;
          })
          .forEach(function (i) {
            var b = document.createElement("button");
            b.type = "button";
            b.textContent = i.quick;
            b.onclick = function () {
              ask(i.quick);
            };
            $("chatQuick").appendChild(b);
          });
      });
    }
    setTimeout(function () {
      try {
        $("chatInput").focus({ preventScroll: true });
      } catch (e) {}
    }, 50);
  }
  function close() {
    $("chat").classList.remove("open");
  }
  function load() {
    if (FAQ) return Promise.resolve(FAQ);
    return fetch("data/faq.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        FAQ = j;
        return j;
      })
      .catch(function () {
        FAQ = {
          greeting: "안녕하세요. 무엇이 궁금하세요?",
          fallback: "상담사가 정확히 안내해 드릴게요.",
          leadThanks: "연락처 잘 받았습니다.",
          items: [],
        };
        return FAQ;
      });
  }
  HC.chatLoad = load;

  $("chatFab").addEventListener("click", open);
  $("chatClose").addEventListener("click", close);
  $("chatForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("chatInput").value;
    $("chatInput").value = "";
    ask(v);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
  HC.chat = { open: open, close: close, ask: ask, answer: answer };
})();
