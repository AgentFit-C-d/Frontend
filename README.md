# AgentFit Frontend

React + Vite + JavaScript + CSS Modules 기반 AgentFit 프론트엔드입니다.
로그인, 프로젝트 목록, 프로젝트 생성, 기획 자료 입력과 AI 분석 연결 전 화면과 시연 Project Profile 편집 및 내 역할·개발환경 입력 화면을 구현했습니다.

## 실행 및 검증

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

초기 검증 환경은 Node.js 26.8.2, npm 11.19.1입니다. Vite 및 설치된 개발 도구의
Node.js 요구사항을 충족하는 버전을 사용하고, 팀의 LTS 버전은 추후 통일합니다.
`npm test`는 Node.js 내장 테스트 러너를 사용하며 추가 테스트 의존성은 없습니다.

## 시연 모드

- GitHub 버튼은 OAuth 연동 전 안내만 보여주며 인증 성공으로 처리하지 않습니다.
- `npm run dev`에서 별도의 **개발용 시연 모드로 둘러보기** 버튼으로 진입합니다.
- `/demo/projects`: 빈 목록, 개발용 예시 표시/닫기 토글, 프로젝트 선택.
- `/demo/projects/new`: 이름 필수·최대 200 코드포인트 검증 후 목록에 반영하고 기획 자료 입력으로 이동.
- 카드 선택은 `/demo/projects/:demoId`의 기획 자료 입력으로 이동합니다.
- 기획 자료는 PDF/Markdown 파일 1개·최대 10 MiB 또는 직접 입력 최대 100,000 코드포인트를 받습니다.
- 프로젝트별 파일·텍스트·활성 탭은 화면 이동 중 메모리에 유지되며 새로고침 시 사라집니다. 잘못된 파일 교체는 기존 유효 파일을 유지합니다.
- PDF 페이지 수·내용은 검증하지 않으며 100페이지 제한은 서버 계약 확인이 필요합니다. 분석 버튼은 활성 탭 입력 검증 후 `/demo/projects/:demoId/analysis`로 이동합니다.
- 분석 화면은 API 미연동 상태만 표시하며 실제 분석·진행률·결과를 생성하지 않습니다. 실제 Project Profile 이동은 비활성화되어 있으며, 카드 내부의 별도 시연 Profile 미리보기로만 `/demo/projects/:demoId/review`에 진입합니다. 기획 자료 수정 및 브라우저 뒤로 가기는 메모리의 입력을 유지합니다.
- 입력 없이 분석 주소에 접근하면 Planning으로 돌아가며, 없는 프로젝트는 기존 프로젝트 없음 안내를 표시합니다.
- ID는 탭 내 시연용 식별자이며 실제 API의 ID 형식과 관계없습니다.
- 모든 시연 데이터는 React 메모리에만 있습니다. 새로고침 또는 시연 종료 시 사라지고
  로그인 화면으로 돌아갑니다. localStorage, sessionStorage, 서버 저장을 사용하지 않습니다.
- 브라우저 이전/다음 이동에서는 작성 중인 이름을 유지합니다. 명시적인 취소는 초안을 비웁니다.
- 예시 프로젝트와 생성 프로젝트 모두 시연 데이터로 표시합니다.
- 프로덕션 빌드에서는 개발용 진입 버튼과 예시 불러오기 버튼을 표시하지 않습니다.
  실제 로그인, 조회·저장 API는 아직 연결하지 않았습니다.

## 구조

```text
src/
  app/                  Router 및 Provider 구성
  assets/               실제 화면에 사용하는 원본 이미지 복사본
  components/layout/    AppLayout, Sidebar, Topbar, Brand, PageHeader
  components/ui/        Button, Card, Badge, FormField
  features/auth/        온보딩 캐러셀
  features/projects/    시연 상태, 검증 로직, 단계 표시
  features/planning/    기획 자료 입력 검증
  features/profile/     고정 시연 fixture, Profile 초안 편집·검증
  features/role/        시연 역할 입력·검증·Review 진입 조건
  pages/                로그인, 목록, 생성, 기획 자료, 분석, 시연 Profile, 역할 화면
  styles/               토큰 및 전역 초기화
tests/                 시연 상태 및 Unicode 입력 검증
```

컴포넌트별 스타일은 CSS Modules로 관리합니다. 색상·글꼴은
`src/styles/tokens.css`, 초기화·공통 포커스는 `src/styles/global.css`에 있습니다.
캐러셀은 4.5초 자동 전환, 수동 선택, hover·키보드 focus 중 정지를 지원합니다. 원본과 동일하게 별도 일시정지 버튼은 표시하지 않습니다.
reduced-motion 설정에서는 자동 전환과 애니메이션을 멈추며 수동 선택은 가능합니다.

## 디자인 기준과 구현 범위

`design-input/index.html`을 최신 시각·시안 인터랙션 기준으로 사용했습니다.
DOCX는 입력·검증 조건 참고 자료이며, 실제 기능·인증·권한 정책은 팀 PRD와 확정 API 계약을
따릅니다. 참고 폴더는 수정하지 않고 Git에서 제외했습니다.
사용하는 7개 이미지만 `src/assets`에 복사했으며 한글 파일명은 빌드용 영문 이름으로 연결했습니다.
루트 `index.html`은 기존 Vite 진입 파일을 유지합니다.

전체 12개 화면 중 나머지 4개 화면은 아직 구현하지 않았습니다. 실제 AI 분석, 추천,
설정 Preview·승인·다운로드, 실제 인증 및 서버 데이터 저장은 구현하지 않았습니다.

## 배포 및 Git

Browser Router를 사용하므로 배포 시 하위 경로 요청을 `index.html`로 연결하는 SPA fallback이
필요합니다. Vite dev 서버는 이 동작을 지원합니다.

`design-input/`, `node_modules/`, `dist/`, 실제 환경변수 파일은 Git에서 제외합니다.
사용 이미지 복사본과 `package-lock.json`은 소스와 함께 관리합니다.
`VITE_` 변수는 브라우저 번들에 포함되므로 비밀정보를 넣지 않습니다.
커밋·Push는 별도 승인 후 진행합니다.

## 시연 데이터 경계

시연 안내는 `/demo` 레이아웃과 개발용 로그인 진입에만 있습니다. 이 Provider의 `active`는
시연 세션 여부이며 인증 상태가 아닙니다. 생성 프로젝트와 예시는 모두 `source: demo`이고,
예시는 별도의 표시 상태로 계산하여 생성 데이터를 삭제하거나 숨기지 않습니다.
실제 API 연동 시에는 별도 인증 세션과 서버 데이터 저장소를 사용하고 시연 Provider와 합치지 않습니다.

## 시연 Project Profile

Analysis의 ‘시연용 Profile 편집 화면 미리보기’는 생성 단계 프로젝트명만 가져오고 나머지는 null로 시작합니다.
고정 fixture는 ‘예시 데이터 불러오기’ → 교체 확인을 거친 경우에만 사용하며 기존 Profile은 재진입 시 유지합니다.
`demoProfiles`에는 `source: demo-manual | demo-fixture`, 편집 `draft`, 마지막 유효 `profile`, 목록 `modes`를
분리해 보관합니다. 실제 분석 결과 저장소가 아니며 Planning 내용을 추론하지 않습니다.
목록의 null(미확인), [](명시적 없음), 값 배열을 유지하고, 빈 편집 행은 확인 시 오류로 처리합니다.
필드는 200 코드포인트, 목록은 최대 30개입니다. 항목 추가·삭제 버튼으로 목록을 편집합니다.
확인은 시연 메모리만 갱신하며 프로젝트 목록 이름이나 실제 분석 상태를 변경하지 않습니다.
재진입 시 초안을 유지하고 새로고침·시연 종료 시 제거합니다. 유효한 시연 Profile 확인 후 05단계 내 역할 입력으로 이동합니다.
실제 분석 상태(API 미연동/대기/진행/완료/실패) 중 현재는 미연동만 표시합니다.
나머지 4종의 문구는 준비되어 있으며 실제 상태는 API 연동 시 연결합니다. OAuth 상태와 독립적으로 처리해야 합니다.
서비스/시연 문구는 명시적 mode로 분리하며 실제 서비스 라우트·인증·요청은 미구현입니다.
[API 연동 준비 메모](docs/API-INTEGRATION.md)에 기존 계약과 확인할 항목을 정리했습니다.

## 내 역할 입력

`/demo/projects/:demoId/role`은 유효한 시연 Profile 확인 후 진입합니다.
역할·담당 업무·경험 수준은 모두 선택이며, 업무는 최대 30개·항목당 200 코드포인트입니다.
프로젝트별 원문 초안을 메모리에 유지하고 오류 시 마지막 유효 값을 보존합니다.
이전·목록 이동 중에는 유지되며 새로고침·시연 종료 시 초기화됩니다.
유효한 역할 입력 확인 후 개발환경 입력으로 이동합니다. API 요청·추천 결과 생성은 수행하지 않습니다.

## 개발환경 입력

`/demo/projects/:demoId/environment`은 유효한 시연 Profile·Role 확인 후 진입합니다.
모든 정보는 선택 입력이고 자동 PC 검사는 없습니다. OS/버전, 현재 설정 상태, 실행 환경,
설치 구성요소, 외부 서비스 인증 준비 상태를 입력합니다. Codex는 시안의 읽기 전용 지원 대상 표시입니다.
목록은 모름(null)과 알고 있는 빈 목록([])을 구분하고 프로젝트별 초안·마지막 유효 값을 보존합니다.
다음 버튼은 07단계 미구현을 안내하며 서버 저장이나 추천 생성을 수행하지 않습니다.
실제 지원 Client와 환경 API 계약은 팀 확인이 필요합니다. 자세한 사항은 API 연동 메모를 참고하세요.
