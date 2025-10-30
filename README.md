# BlayBus Task Helper

![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Glass_UI-blue?logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Web_Extension-orange?logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)


**BlayBus Task Helper**는 [Blaybus(프로젝트/일정/협업 툴)](https://www.blaybus.com/)에서 **페이지를 직접 열지 않아도** Task를 빠르게 생성·시작하고, 팝업에서 **한 번에 중지**할 수 있게 도와주는 브라우저 확장 프로그램입니다.

## ✨ 주요 기능

빠른 Task 생성과 타이머 시작/종료 기능을 웹페이지 접속없이 확장 프로그램을 통해 조작할 수 있습니다.

- **원클릭 Task 생성**: Task명을 입력하면 자동으로 Task를 생성하고 타이머를 시작합니다.
- **빠른 타이머 종료**: 진행 중인 Task를 빠르게 종료할 수 있습니다.
- **탭 전환 세션 유지**: 기존에 열려있는 탭을 재사용하므로, 별도의 인증 정보를 요구하지 않습니다.

## 🚀 설치 방법

수동 설치 방법은 다음과 같습니다.

1. 이 저장소를 로컬에 복제/다운로드합니다.
2. Chrome/Edge 주소창에 `chrome://extensions` 입력 → 이동.
3. 우측 상단 **개발자 모드(Developer mode)** 활성화.
4. **압축 해제된 확장 프로그램을 로드(Load unpacked)** 클릭.
5. 이 프로젝트 폴더를 선택하면 확장이 추가됩니다.
6. 팝업에서 **워크스페이스 URL**을 저장하고, **Task 이름**을 입력해서 바로 테스트하세요.


## 🧭 사용 방법

워크스페이스 URL 저장

1. **워크스페이스 URL 저장**
   - 팝업 열기 → `https://www.blaybus.com/project/1234/workspace?view=list` 형식의 URL 입력 → **저장**.
2. **Task 생성 & 시작**
   - 팝업의 **Task 이름** 입력 후 `Enter` → 잠시 후 정지 버튼이 표시되면 시작 완료.
3. **Task 중지**
   - 팝업의 **정지 버튼** 클릭 → 타이머 중지, 입력창이 다시 활성화됩니다.

> 팝업이 닫혔다 다시 열려도 **진행 중 상태**가 유지되어, 실수로 창을 닫아도 바로 중지할 수 있습니다.

## 📂 프로젝트 구조
```
blaybus-task-helper/
│
├── manifest.json         # 확장 설정/권한/엔트리
├── background.js         # 백그라운드(서비스 워커): 탭 열기/라우팅/메시지 허브
├── content.js            # 컨텐츠 스크립트: DOM 조작(클릭/입력/엔터 커밋 등)
├── popup.html             # 팝업 UI
├── popup.css              # Glass UI 스타일(톤다운 블루)
├── popup.js               # 팝업 로직(저장/상태 복원/이벤트)
└── icons/                 # 확장 아이콘 세트(16~512px)
```

## 🛡️ 권한 설명

- **`storage`**: Workspace URL/Task 상태 저장 및 복원.

모든 자동화는 명시적으로 버튼을 눌렀을 때만 작동하며, 지정된 도메인 밖에서는 동작하지 않습니다.


## 📄 라이선스

이 프로젝트는 [MIT 라이선스](https://opensource.org/licenses/MIT)를 따릅니다.

