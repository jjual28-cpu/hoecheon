# 사이트 이미지·영상 출처 (원본은 읽기만 함, 이동·수정 없음)

다시 만들기: `site\_design\v3\make_images.py` (PyMuPDF·Pillow·ffmpeg)

PDF = `G:\내 드라이브\부동산\(배포용) GTX회천 대광로제비앙 모아엘가 상담자료_26.08.03.pdf`
(가격 페이지 26~33쪽은 쓰지 않음)

| 사이트 파일 | 원본 | 방법 |
|---|---|---|
| assets/v3/hero.webp, hero-s.webp | PDF 4쪽 투시도 (내장 이미지 xref 60, 3515x1979) | 2400·1200px webp |
| assets/v3/hero-m.webp | 같은 투시도 | 가운데 세로로 잘라 1000x1470 (모바일 히어로) |
| assets/v3/aerial.webp, aerial-s.webp | PDF 5쪽 조감도 (xref 64, 3212x1807) | 2000·1000px |
| assets/v3/map-life.webp | PDF 20쪽 생활권 지도 (300dpi 렌더, 지도 부분만) | 오른쪽 설명 글 칸 제외 |
| assets/v3/map-metro.webp | PDF 17쪽 메트로 위치도 (300dpi 렌더, 지도 부분만) | 노선 목록 칸 제외 (지도 안 작은 공식 지명 표기는 원본 그대로) |
| assets/v3/siteplan.webp | PDF 7쪽 단지 배치도 (xref 73) | 원본 크기 |
| assets/v3/community.webp | PDF 8쪽 커뮤니티 (xref 78) | 원본 크기 |
| assets/v3/plan-84a.webp | PDF 9쪽 84A 3D 평면 (xref 97) | 1400px, 검은 배경 그대로 |
| assets/v3/plan-84b.webp | PDF 10쪽 84B 3D 평면 (xref 125) | 1400px |
| assets/v3/glass-rail.webp | PDF 12쪽 유리난간 사진 (xref 157) | 원본 크기 |
| assets/v3/film.mp4 | `G:\내 드라이브\부동산\KakaoTalk_20261109_161127126.mp4` (홍보 CG 영상) | 글자 없는 항공 구간 17.5–21.6초 · 131.5–139초 이어 붙임, 무음 720p 12초 (약 2.3MB) |
| assets/v3/film-poster.webp | 같은 영상 17.5초 화면 (영상 첫 화면) | 1280px |
| assets/v3/cg-park.webp | 같은 영상 31.8초 단지 산책길 CG (글자 없음) | 1280px — 07 혜택 섹션 |
| assets/v3/cg-towers.webp | 같은 영상 50초 동 외관 CG (글자 없음, 배너 영상에는 안 들어감) | 1280px — 09 상담 섹션 |
| assets/units-map.webp | PDF 6쪽 동·호 배치 (v2 때 추출) | 그대로 |
| img/pNN.webp, pNN-s.webp | 모델하우스 사진 — `hoecheon\assets\photos\photoNN.jpg` = 카톡 원본 (목록: `hoecheon\assets\SOURCES.md`) | v2 때 골라 둔 컷 재사용 |

v3에서 쓰는 모델하우스 사진: p06 거실, p63 알파룸, p20 식탁, p17 주방, p13 안방, p52 드레스룸, p30 작은방, p53 욕실, p12 발코니, p19 주방, p51 드레스룸. 같은 사진은 한 페이지에 한 번만 씀 (거실 사진은 갤러리에만).
PDF 16쪽 광역 도로망은 지도 안 "양주시" 글자가 커서 쓰지 않음.

## 11/13 추가 (현장 상담 대본 소구포인트 섹션)
| 사이트 파일 | 원본 | 방법 |
|---|---|---|
| assets/v3/town-dusk.webp | `G:\내 드라이브\부동산\KakaoTalk_20261109_161127126.mp4` 136.5초 (해 질 녘 항공, 글자 없음) | 1280x720 — 03 회천 3단계 |
| assets/v3/facade.webp | 같은 영상 22.5초 (동 정면 외관, 글자 없음) | 1280x720 — 05 일자형 배치 블록 |
| assets/v3/map-edu.webp | assets/v3/map-life.webp 에서 학교 계획 부분만 잘라냄 (320,262)-(1150,1012) | 830x750 — 06 교육 |
