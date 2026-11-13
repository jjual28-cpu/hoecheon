/* =========================================================
   회천 분양 랜딩 — 설정 한 곳
   상담사 정보·Apps Script 주소·혜택 문구는 여기만 고치면 됩니다.
   ※ 문구 규칙은 ../COPY_RULES.md 를 따른다 (금지어 목록·각주 표기).
   값이 비어 있거나 자리 표시(OOO, 010-0000-0000)면 화면에서 자연스럽게 대체됩니다.
   ========================================================= */
window.SITE_CONFIG = {
  /* 상담사 (오빠 정보로 바꾸기) */
  CONSULTANT: {
    NAME: "OOO 팀장", // 예: "김OO 팀장"
    PHONE: "010-0000-0000", // 예: "010-1234-5678"
    KAKAO_URL: "https://pf.kakao.com/_RSVNX/chat", // 카카오톡 채널 '새집알리미' (현장 바뀌어도 계속 씀, 11/11 개설)
  },
  /* 현장 대표번호 (전단지) — 상담사 번호가 비어 있을 때 대신 보여 줌 */
  SITE_PHONE: "", // 사이트에 전화번호를 노출하지 않음 (모든 문의는 시트에 먼저 기록 — 11/11 결정)

  /* 구글 Apps Script 웹앱 주소 (backend/설치안내.md 참고). 비어 있으면 '시험 모드' */
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbxVOR6gOxIg1yXfJUC34tyWLrTh-7qHQpRTE88kXDkBTbz5NEOVamxR3rZoRBIcXkNZ/exec",

  /* 사이트 실제 주소 (소개 링크 만들 때 사용). 비우면 지금 열린 주소 기준 */
  SITE_URL: "https://jjual28-cpu.github.io/hoecheon/",

  /* 단지 기본 정보 (상담자료 p2·p6·p9·p10) */
  COMPLEX: {
    NAME: "GTX회천 대광로제비앙 모아엘가",
    SHORT: "대광로제비앙 모아엘가",
    ADDRESS: "회천지구 공동주택 A8블럭",
    HOUSEHOLDS: 361,
    SCALE: "지하 2층 ~ 지상 29층 · 4개동",
    MOVE_IN: "2029.06",
    TYPES: {
      "84A": {
        count: 322,
        exclusive: "84.9051㎡",
        supply: "112.2281㎡",
        service: "38.5275㎡",
      },
      "84B": {
        count: 39,
        exclusive: "84.9386㎡",
        supply: "113.5971㎡",
        service: "34.4063㎡",
      },
    },
  },

  /* 혜택 문구 (COPY_RULES.md 기준 — 각주 NOTE 는 혜택 문구와 같은 화면에 꼭 같이 나와야 함) */
  BENEFIT: {
    HEADLINE: "계약금 0원", // 히어로: "회천신도시, 2029년 입주 전까지" + 이 문구 + ※
    DETAIL:
      "회천신도시, 2029년 입주 전까지 계약금 0원※. 계약금 대출 조건에 지원 혜택을 적용한 조건이며, 자세한 내용은 상담에서 안내드립니다.",
    NOTE: "※ 계약금 대출조건이며, 개인의 신용도에 따라 대출이 제한될 수 있음 | 지원 혜택 적용 시",
    EXTRA: "선착순 동·호 지정",
  },

  /* 소개 사례 — 금액을 비워 두면 "사례는 상담사에게 문의" 로 표시 */
  REFERRAL: {
    REWARD: "", // 예: "계약 1건당 50만원"
    NOTE: "소개해 주신 분이 계약하시면 감사의 사례를 드립니다.",
  },
};
