# AgentFit Frontend

React + Vite + JavaScript + CSS Modules 기반 AgentFit 프론트엔드입니다.
1차 구현은 로그인, 프로젝트 목록, 프로젝트 생성 화면까지입니다.

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
- `/demo/projects/new`: 이름 필수·최대 200 코드포인트 검증 후 목록에 반영.
- 카드 선택은 현재 목록의 클라이언트 상태만 변경하며 URL·스크롤·포커스를 초기화하지 않습니다. 기획 화면 미구현은 목록 아래에서 안내합니다.
- 기존 `/demo/projects/:demoId` 주소는 목록으로 복귀시킵니다.
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
  pages/                로그인, 목록, 생성 화면
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

전체 12개 화면 중 나머지 9개 화면은 아직 구현하지 않았습니다. AI 분석, 추천,
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
