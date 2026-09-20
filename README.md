# 생활 한국어 첫걸음 (Survival Korean for Adult Learners)

성인 외국인 학습자를 위한 **한국어 온라인 수업 지도안**과 **자기주도 학습용 웹 앱**을 담은 저장소입니다.

## 구성

```
.
├── lesson-plans/              # 교사용 지도안 (Markdown)
│   ├── 00-course-overview.md  # 전체 교육과정 개요
│   ├── 01-greetings-introduction.md
│   ├── 02-numbers-time.md
│   ├── 03-shopping.md
│   ├── 04-ordering-food.md
│   └── 05-directions-transportation.md
└── app/                        # 온라인 학습 웹 앱 (설치 불필요, 브라우저에서 실행)
    ├── index.html
    ├── styles.css
    ├── app.js
    └── data/lessons.json       # 어휘·문법·대화문·퀴즈 데이터
```

## 지도안 (Lesson Plans)

`lesson-plans/` 폴더에는 5차시로 구성된 초급 생존 한국어 강좌의 지도안이 들어 있습니다. 각 지도안은 다음 형식을 따릅니다.

- 학습 목표 / 대상 / 시간 / 준비물
- 핵심 어휘 및 문형
- 도입 → 어휘 제시 → 문법 설명 → 대화 연습 → 퀴즈·정리로 이어지는 50분 수업 흐름
- 과제 (Homework)

실시간 화상 수업(Zoom, Google Meet 등)에서 교사가 그대로 활용할 수 있도록 작성되었습니다.

## 온라인 학습 앱 (Online Class App)

`app/` 폴더는 순수 HTML/CSS/JavaScript로 만든 웹 앱으로, 별도 설치나 빌드 과정 없이 브라우저에서 바로 실행할 수 있습니다.

### 주요 기능

- **5개 차시 학습**: 인사/자기소개, 숫자/시간, 쇼핑, 음식 주문, 길 묻기
- **어휘 탭**: 단어 카드 + 발음 듣기 버튼 (브라우저 음성 합성 API 사용)
- **문법 탭**: 핵심 문형과 예문 정리
- **대화문 탭**: 실제 대화 예시, 문장별 발음 듣기 + 전체 듣기
- **연습문제 탭**: 객관식/빈칸 채우기 퀴즈, 즉시 채점 및 피드백
- **진도 저장**: 브라우저 로컬 저장소(localStorage)에 차시별 완료 여부와 점수를 저장, 80점 이상 시 완료 처리

### 실행 방법

브라우저 보안 정책상 `data/lessons.json`을 `fetch`로 불러오려면 로컬 웹 서버를 통해 열어야 합니다 (HTML 파일을 더블클릭해서 바로 열면 데이터가 로드되지 않을 수 있습니다).

```bash
cd app
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

또는 Node.js가 설치되어 있다면:

```bash
npx serve app
```

### GitHub Pages로 배포하기

1. 저장소 Settings → Pages 로 이동
2. Source를 "GitHub Actions"로 설정하고 `app/` 폴더를 정적 사이트로 배포하는 워크플로를 구성하거나,
3. 간단하게는 `app/` 폴더 내용을 저장소 루트 또는 `docs/` 폴더로 복사한 뒤 Pages Source를 해당 위치로 지정하면 별도 빌드 없이 바로 서비스할 수 있습니다.

## 라이선스

교육 목적으로 자유롭게 사용, 수정할 수 있습니다.
