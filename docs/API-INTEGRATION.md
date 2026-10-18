# Analysis / Profile 연동 준비 메모

기준: 팀 공유 `AgentFit-team-handoff-2026-09-08-v2/Docs/api/openapi.phase1.json`,
`Docs/api/01-project-analysis.md`. 아래 주소는 기존 계약을 요약한 것이며 이번 작업에서 호출하거나 새로 구현하지 않았다.

| 기능 | 기존 계약 / 프론트 연결 지점 |
| --- | --- |
| 인증 세션 | GET `/api/auth/get-session`: `{user:{id,name},session:{expiresAt}}` 또는 null. 토큰을 프론트에 노출하지 않는다. OAuth 성공은 분석 상태 전환 신호가 아니다. |
| 분석 시작 | POST `/api/projects/{projectId}/analysis`: raw PDF bytes / Markdown / 직접 텍스트. MIME application/pdf, text/markdown, text/plain. 10 MiB·100페이지·100,000 코드포인트 제한. 클라이언트 파일 검사는 페이지/내용 검증을 대체하지 않는다. |
| 분석 응답 | 성공 시 `{draft,attempt}`. Profile은 data/sources/evidence/unknownFields/version, Attempt는 id/status/errorCode/시간·문서 요약 포함. 실패해도 이전 유효 Profile을 삭제하지 않는다. |
| 상태·Profile 조회 | GET `/api/projects/{projectId}`: project/confirmed/draft/latestAttempt 키는 항상 존재하며 미존재 값은 null. 별도 상태 조회 엔드포인트를 만들지 않는다. |
| Profile 확인 저장 | PATCH `/api/projects/{projectId}/profile`: expectedVersion + data 10개 필드 전체. draftId/draftVersion은 함께 전송하거나 함께 생략. 응답 `{project,confirmed}`를 기준으로 상태 갱신. sources/evidence 등 서버 계산 필드는 제출하지 않는다. |

## 상태 및 표시 정책

- UI 상태는 unavailable / queued / processing / completed / failed로 구분한다.
- 계약의 PROCESSING / SUCCEEDED / FAILED를 각각 진행 / 완료 / 실패에 대응시킨다.
- 현재 계약은 별도 작업 큐나 취소 endpoint를 정의하지 않는다. queued는 UI 표현만 준비했으며 실제 대기 신호·조회 주기·재시도·취소 UX는 팀과 확인한다.
- `getAnalysisPresentation(status, mode)`와 AnalysisScreen에 명시적으로 상태를 전달한다.
  현재 `/demo` 라우트는 항상 demo + unavailable이며 타이머·요청·가짜 결과가 없다.
- `getProfilePresentation(mode)`는 서비스와 시연 문구를 분리한다.
  실제 서비스 연결 시 별도 인증/서버 데이터 컨테이너를 연결하고 demoProfiles를 재사용하지 않는다.
  실제 이용 불가 상태에서도 서비스 오류 안내를 표시한다.

## 데이터 및 미확정 사항

- Profile 문자열: null 또는 공백뿐이지 않은 1~200 코드포인트. 단, 사용자 확인 시 필수인 프로젝트명은 팀 확정 정책에 따라 trim 후 1~100 코드포인트로 제한한다.
  필수 프로젝트명은 빈 초안을 유지하고 확인 시 오류로 처리한다. 선택형 단일 필드(유형·도메인·Database·Deployment)는 삭제·공백 입력을 null로 처리하고 배지를 자동 갱신한다. 목록의 상태 정책은 별개로 유지한다.
- 목록: null(미확인), [](확인된 없음), 값 배열(최대 30개·항목당 200 코드포인트)을 구분한다.
- `demoProfiles[id]`의 source는 demo-manual 또는 demo-fixture. draft와 마지막 유효 profile을 분리한다.
  기존 entry는 재진입 시 초기화하지 않고, 명시적인 예시 교체만 확인 후 허용한다.
- 팀 확정 정책: 프로젝트명은 사용자에게 하나다. 생성과 Review는 100 코드포인트로 통일한다.
  Review 전체 검증을 통과해 확인할 때만 Profile.project_name과 목록 Project.name을 함께 갱신한다.
  초안 편집·오류·예시 불러오기만으로는 목록 이름을 바꾸지 않는다. 서버 계약의 중복 필드는 삭제하지 않는다.
- API 문서의 Project.name은 trim 후 1~100 code points이며 ProfileData.project_name은 현재 null 또는 최대 200 code points다.
  UI는 더 엄격한 100을 적용한다. PATCH 응답의 project/confirmed를 함께 갱신하는 서버 원자성·버전 정책은 확인이 필요하다.
- 실제 OAuth 공급자 연결·세션 만료, 소유권/Origin 검증, 버전 충돌(409), 분석 오류/중단 복구,
  네트워크 재시도 및 중복 시작 방지는 미구현이다. 서비스 모드 라우트도 아직 제공하지 않는다.

## 커밋 전 모드 검증

- 서비스/시연 Analysis·Profile 컴포넌트를 정적 렌더링하여 시연 버튼·문구 노출을 검사한다.
- 서비스 표시 모드에 demo-manual/demo-fixture를 주입하면 편집 화면 대신 데이터 오류 안내를 표시한다.
- 현재 운영 가능한 서비스 라우트는 없다. 정적 서비스 렌더링은 인증·API 연결 검증이 아니다.
- 상태 문구 5종, 진행 중 원본 제목, 신규 Profile의 예시 미주입, 명시적 예시 교체,
  Profile 확인과 분석 완료의 독립성은 자동 테스트로 확인한다.
- 실제 세션 만료·소유권·AI 응답/오류·서버 버전 충돌 및 상태 전환은 백엔드 연동 후 검증한다.

## Role 05/10 (시연 구현)

- HTML·DOCX 기준: 역할(프론트엔드/백엔드/풀스택/AI/디자이너) 단일 선택,
  담당 업무 여러 줄(최대 30개·각 200 코드포인트), 경험 수준(초보/중급/숙련) 단일 선택.
  모두 선택 입력이며 미입력도 유효하다. 공백 줄은 업무 항목에서 제외하고 원문 초안은 보존한다.
- 팀 확정 정책으로 textarea 원문 전체를 줄바꿈·공백·구분자 포함 최대 6,000 코드포인트로 검증한다.
  항목별 200·최대 30개 조건도 함께 유지한다. 원문을 trim하거나 자동 절단하지 않으며 오류 초안과 마지막 유효 value를 분리한다.
  UI에서는 한 줄에 한 업무를 입력한다. LF는 1, 원문에 CRLF가 있으면 2 코드포인트로 계산한다.
  API에 배열만 보낼지, 원문도 보낼지, 줄바꿈 정규화·배열 join 구분자·길이 산정 시점은 계약 확인이 필요하다.
- `/demo/projects/:demoId/role`은 확인 완료·유효한 시연 Profile만 허용한다.
  이는 AI 분석 성공을 의미하지 않는다. Review 수정으로 확인 상태가 해제되면 재확인이 필요하다.
- `roleDrafts[id]`의 source는 demo-user. draft(역할/원문 업무/경험)와 마지막 유효 value를
  분리하고, API 모델로 간주하지 않는다. 신규 Role fixture는 없으며 현재 세션에서만 보존한다.
- 실제 서비스 모드 Role UI는 인증/역할 API 미연동 안내로 차단한다.
  OAuth 성공만으로 접근이나 분석 상태를 바꾸지 않는다.
- 공유 OpenAPI phase1에는 Role 경로/스키마가 없다. 저장·조회 방법, 실제 enum 코드,
  미선택 값의 null/문자열/빈 배열 표현, 버전·소유권·Profile 연결 정책은 팀 합의가 필요하다.
- 다음 버튼은 유효 입력을 시연 메모리에 확인한 후 06단계로 이동한다.

## Environment 06/10 (시연 UI 모델)

- 모든 입력은 선택이다. OS 종류는 미정/Windows/macOS/Linux/기타, OS 버전은 자유 텍스트다.
  ‘기타’ 전용 추가 입력은 원본에 없으므로 만들지 않았다. OS·버전도 추정하거나 PC에서 검사하지 않는다.
- 현재 설정 상태는 UNKNOWN/USER_SAYS_EMPTY/HAS_EXISTING. 실행 환경과 설치 구성요소는
  UNKNOWN(null)과 KNOWN(빈 배열 또는 이름·버전 행)을 구분한다. 정보 상태 전환 시 행 초안은 보존하고,
  확인 value에는 UNKNOWN이면 null, KNOWN이면 [] 또는 실제 행을 넣는다.
- AI Client는 확정 MVP인 Claude Code의 읽기 전용 표시다. 설치 여부를 탐지하거나 인증을 확인하지 않는다.
  Codex는 후속 지원이며 선택지를 추가하지 않았다. 아래 구현 기록과 전환 영향 분석을 참고한다.
- 외부 서비스 준비 상태는 서비스명 + UNKNOWN/READY/NOT_READY로 입력한다.
  실제 로그인 상태나 토큰이 아니며 사용자 선언이다. Secret·인증 토큰 입력을 요구하지 않는다.
- 시안과 DOCX의 30행·200 코드포인트를 적용했다. 전부 미입력은 유효하다.
  사용자가 추가한 빈 행은 이름을 채우거나 삭제하도록 안내한다. 버전은 선택이다.
  서비스명에도 200 코드포인트·30행 보호를 적용했으며 이는 UI 임시 검증 정책이다.
  행별 필수 조건·서비스명 제한은 원본의 상세 검증이 없으므로 API 계약에서 확정해야 한다.
- `environmentDrafts[id]`는 source: demo-user, 편집 draft와 마지막 유효 value를 분리한다.
  Role의 유효 확인 후 진입하며 재진입·목록 이동 중 보존하고 새로고침·시연 종료 시 초기화한다.
- 공유 phase1 OpenAPI에 Environment 경로/스키마가 없다. 저장/조회 endpoint, enum 값,
  USER_DECLARED 출처 표현, null/빈 배열, 버전·권한·부분 수정·Profile/Role 연결 정책은 미확정이다.
  현 UI 모델을 서버 계약으로 확정하지 않는다. 실제 서비스 모드는 미연동 안내로 차단한다.
- 다음 버튼은 유효 입력을 시연 메모리에서 확인하고 07단계 시연 화면으로 이동한다.
  서버 저장·환경 검사·추천 생성은 실행하지 않는다.


## 02~06단계 모드 점검 범위

Planning은 `/demo` 전용 컨테이너이며 서비스용 Planning 화면은 아직 없다.
Analysis의 시연 진입·안내와 Review의 예시 불러오기는 demo 표시에서만 제공한다.
서비스 표시 모드에서 Review는 demo-manual/demo-fixture 입력을 거부하고,
Role·Environment는 실제 서비스 기능 자체를 미연동 안내로 차단한다.
서비스/시연 문구·데이터 보호는 정적 렌더링 및 모델 테스트이며 실제 인증·API E2E 검증은 아니다.
실제 서비스 라우트, OAuth 세션/소유권, API 응답·저장·상태 전환은 연동 후 구현·검증해야 한다.

## Capability 추천 07/10 (미실행 + 명시적 시연 미리보기)

- HTML·DOCX의 Capability 9개와 필요성 REQUIRED/OPTIONAL/UNDETERMINED,
  정상 추천 표현 4종(RECOMMENDED/NO_ADDITIONS_NEEDED/NEEDS_INFORMATION/NO_COMPATIBLE_TOOLS)을 재현한다.
  PRD는 역할명 하나로 필수 능력을 확정하지 않고 네 결과와 검증된 이유·호환 조건을 구분하도록 요구한다.
- 기본 실제 결과 뷰 모델은 NOT_RUN, capabilities:null, tools:null이다. 이는 서버 DTO가 아니다.
  추천 미실행, 응답 데이터 null, 확인된 빈 목록 [], 실제 값 배열을 동일하게 취급하지 않는다.
  오류/이용 불가도 정상 추천 결과로 대체하지 않는다.
- `recommendationPreviews[id]`의 source는 demo-ui이며 별도 미리보기 조작값만 보관한다.
  사용자가 명시적으로 열기 전에는 상태 버튼이 숨겨지고 필요성 select는 비활성이다.
  고정 예시는 디자이너 항목·상태 문구뿐이며 추천 도구 fixture·점수·규칙·자동 분석은 없다.
  미리보기 선택을 실제 결과 저장소에 쓰지 않는다. 닫기·재진입은 시연 선택을 보존한다.
- 유효 확인된 Profile·Role·Environment만 demo 화면 이동을 허용한다.
  수정으로 Environment 확인이 해제되면 재확인이 필요하다. 이전 단계/목록 이동 중 입력은 유지한다.
  실제 결과 기반 08단계 진입은 제공하지 않고, 별도 시연 버튼으로만 Selection을 확인한다.
- service 표시는 인증·추천 API 미연동 오류로 차단하고 시안 항목·예시를 표시하지 않는다.
  서비스 라우트·실제 API 연결은 없다. OAuth 성공은 추천 실행/분석 완료의 근거가 아니다.
- 현재 프론트 표현 가능: 9개 Capability 표시, 필요성 시안 선택, 네 결과의 문구 미리보기,
  미실행/결과 없음/실패/이용 불가 안내. 실제 도구 목록은 어떤 상태에서도 생성하지 않는다.
- 공유 phase1 OpenAPI에는 추천/Capability 경로·스키마가 없다. 백엔드 합의 필요:
  시작·조회 방식, 결과 버전/입력 snapshot 식별자, 상태·오류 코드, Capability 분류와 출처,
  필요성·근거·불확실성, Catalog 도구 ID/버전·호환 조건·권한·위험도, 결과 null/[] 의미,
  재분석 시 이전 결과 무효화 및 동시 수정 정책.
- 팀 확정 MVP는 Claude Code 우선, Codex 후속이다. 07단계는 특정 Client 필드를 읽거나
  호환성을 판단하지 않는다. 06단계의 Codex 표시는 디자인 참고 표시이며 실제 지원 확정이 아니다.
  지원 정책과 Client별 서버 필드는 별도 합의 후 어댑터에 연결해야 한다.

## Selection 08/10 (명시적 시연 진입)

- 07단계 정상 결과 CTA는 실제 결과 없이 진행하지 않는다. 별도 ‘시연용 도구·권한 화면 미리보기’만
  유효한 시연 입력과 함께 진입한다. 이 이동은 추천 성공이나 권한 승인이 아니다.
- 기본 실제 데이터는 tools:null, permissions:null(미조회)이다. 조회 결과 [] 및 값 배열과 구분한다.
  시연 상태는 `selectionPreviews[id]`, source: demo-ui에만 저장하고 실제 결과 저장소와 합치지 않는다.
- 원본에는 실제 도구/고정 Catalog 목록이 없었다. 선택 동작 QA를 위해 ‘필수 카드 UI 예시’와
  ‘선택 카드 UI 예시’라는 추상 카드를 별도 demo fixture로 둔다. 명시적으로 예시를 열어야 나타나며
  실제 도구명·지원 버전·추천 이유·호환성·필수 권한을 주장하지 않는다.
- 원본의 필수 카드 고정/선택 카드 토글을 재현한다. 예시의 필수 표시는 UI 동작만 의미한다.
  권한 조작값은 ALWAYS_ALLOW/ASK_EACH_TIME/DENY, 기본 ASK_EACH_TIME이지만 실제 정책은 미정이다.
  예시가 닫혀 있으면 실제 정책 미조회 표시와 함께 조작을 비활성화한다.
- 카드 선택, 권한 조작값, 권한 설명 펼침을 분리한다. 선택 카드 해제로 권한 값을 바꾸지 않는다.
  필수 예시 카드 + DENY 경고는 가상 조합 검증일 뿐 실제 Capability/manifest 판정이 아니다.
- 실제 서비스 모드는 인증·검증된 추천/Catalog 미연동 안내로 차단하고 시연 데이터를 표시하지 않는다.
  Secret 입력, 설치, 토큰 저장, 실제 승인, 설정 파일 생성은 없다.
- 09단계는 미구현이다. 다음 버튼은 시연 조합 검증 및 미구현 안내만 하고 이동하지 않는다.
- 백엔드 합의 필요: Catalog 도구 ID/버전·출처, 필수/선택 여부, 추천 snapshot/버전, Client 지원 조합,
  도구별 manifest 권한 범위·정책 기본값·거부 시 처리, 선택 저장/조회 계약·소유권·동시 수정 정책.
  실제 계약 없이 경로·응답이나 호환 규칙을 추가하지 않았다. 원본에도 도구 상세 화면은 정의되어 있지 않아 만들지 않았다.


## 팀 확정 정책 및 Claude Code MVP 전환 영향 분석 (2026-10-18)

이번 변경은 프로젝트명·업무 길이 정책 반영과 영향 분석까지다. 06~08 UI의 Client 전환,
09 Preview/10 다운로드 구현, 실제 추천·설정 생성·OAuth·API 연결은 수행하지 않았다.
시연 예시·프로젝트별 격리·service 차단은 유지한다.

### 프로젝트명: 중복 필드와 하나의 사용자 개념

- 프론트에 별도 이름 필드가 **있다**: `projects[].name`, `demoProfiles[id].profile.project_name`,
  `draft.project_name`. draft는 편집 버퍼, profile은 마지막 유효 확인값이다.
  API에도 `Project.name`과 `ProfileData.project_name`이 별도로 정의되어 있다.
- 사용자 관점의 이름은 하나다. Review의 유효한 전체 확인을 통해 두 확인값을 동기화한다.
  저장 전 초안·오류는 목록 이름을 덮어쓰지 않으며 다른 프로젝트에는 영향을 주지 않는다.
  예시 Profile 불러오기는 현재 프로젝트명을 유지한다. 예시 프로젝트 카드의 이름 수정도 세션 중 유지한다.
- `01-project-analysis.md`는 Project.name을 trim 후 1~100 **code points**로 명시한다.
  UTF-16 length/바이트/화면상 글자 묶음이 아닌 `Array.from(value.trim()).length`를 사용한다.
  이모지 한 코드포인트는 1, 결합 문자·ZWJ 조합은 구성 코드포인트 수로 계산한다.
  생성 입력의 기존 자동 제한 동작은 100으로만 줄였다. Review 오류 초안은 자르지 않는다.
- 서버 확인 필요: Profile 확인 PATCH에서 Project.name도 같은 트랜잭션으로 갱신하는지,
  project/confirmed version과 409 처리, 분석 추출 이름은 사용자 확인 전 목록에 미반영하는지,
  Profile 이름의 현 200 제한을 100으로 정렬할지. 기존 OpenAPI/서버 원본은 수정하지 않았다.

### Client 전환 범위

| 영역 | 반드시 변경할 부분 / 디자인 수정 대상 | 재사용 가능 | 팀·백엔드 추가 확인 |
| --- | --- | --- | --- |
| 06 Environment | 현재 Codex ‘MVP 지원 대상’ 배지·다른 Client 미지원 설명·Codex 버전 라벨·하단 문구를 Claude Code 기준으로 수정. 현재 설정 상태가 어느 Client/범위인지 표시 | OS·runtime·설치 구성요소·외부 준비 상태, 선택/미확인 UI 및 초안 보호 | 명시적 Client 식별자, 지원 버전·OS·설정 범위, 기존 설정 입력 방식. `clientVersion`만으로 대상 식별 불가; 기존 Codex 버전 입력을 Claude 버전으로 자동 이관 금지 |
| 07 Capability | 실제 Client별 지원·호환 결과/근거를 서버 응답으로 표시. 9개 항목을 Claude 지원 확정 목록으로 간주하지 않음 | Capability 목록/필요성/네 결과 카드, 명시적 demo 미리보기 | Catalog 분류·Client/버전 호환성·근거/불확실성·snapshot 계약. 추천 규칙/점수 미구현 유지 |
| 08 Selection | 검증된 Claude 대상 도구·manifest 권한을 표시하고 승인 범위 문구 재설계. 현재 3개 권한값은 추상 시연 조작값 | 선택 카드·필수/선택 표시·상세 펼침·미조회/null/[]·프로젝트별 상태 | 실제 Catalog ID/버전, 필수 판정, 도구별 권한 범위, 거부 동작, 저장·조회·동시 수정 계약. ALWAYS_ALLOW/ASK_EACH_TIME/DENY를 Client 설정 키/모드에 일대일 대응 금지 |
| 09 Preview·설정 생성 (미구현) | Claude 전용 파일·범위·변경안·충돌/Diff와 최종 승인 대상을 설계. Codex 경로·템플릿 재활용 금지 | 선택 요약·권한 요약·파일 상태·미확인 안내·승인 UI 구조 | 생성 주체·파일 종류/스키마/경로·기존 설정 수집/정제·병합/검증·기준 fingerprint/버전·승인 취소/재확인 계약 |
| 10 다운로드·적용 (미구현) | Claude 전용 산출물·적용 위치·인증/재시작/확인 방법·실패 안내로 디자인 변경 | 다운로드/보고·재시도 UI 구조, ‘생성 완료’와 ‘검증 미수행’ 분리 | 산출물 ID/다운로드 계약·승인 일치·인증 경계·사용자 보고와 실제 검사 구분. 다운로드만으로 설치/검증 완료 처리 금지 |

### 설정·권한은 Client마다 별도 계약

공식 문서를 확인한 기술적 배경이며 AgentFit의 확정 지원 파일 목록은 아니다:

- [Claude Code 설정](https://code.claude.com/docs/en/settings)은 JSON 설정 파일과 사용자/프로젝트/로컬/관리 범위를 구분한다.
  `.claude/settings.json`과 `.claude/settings.local.json`을 같은 배포 대상으로 보지 않는다.
- [Claude Code 권한](https://code.claude.com/docs/en/permissions)은 allow/ask/deny 규칙·모드·관리 정책을 구분한다.
  UI의 ‘항상 허용’ 선택만으로 모든 실행을 허용하거나 상위 정책을 덮어쓴다고 주장하면 안 된다.
- [Codex 설정](https://developers.openai.com/codex/config-basic/)은 `config.toml` 기반이며 별도 범위·우선순위가 있다.
  JSON↔TOML 치환만으로 승인/샌드박스/manifest 의미가 같아지지 않는다.

Claude Code 우선은 기존 PRD §4의 Claude 중심 정책과 일치한다. Codex 중심 HTML·DOCX 및 현재 06 표시와는 충돌한다.
phase1 OpenAPI에는 Role/Environment/추천/Selection/Config/다운로드 계약이 없어 해당 필드를 현재 계약과 대조할 수 없다.
따라서 UI 임시 모델을 서버 DTO로 확정하지 않는다.

Codex 후속 지원을 위해 향후 데이터에 Client 식별자·지원 버전·Catalog 호환 대상·권한 모델 버전·
템플릿/산출물 유형을 명시하고, 공통 입력/카드와 Client별 설정 생성·검증·적용 안내를 분리할 필요가 있다.
지금은 어댑터나 신규 API를 구현하지 않는다. 서버·디자인 합의 후 전환하고 이전 시연 값을 자동 변환하지 않는다.

### 최종 Selection UI QA

1280px에서 원본과 카드 너비(442.45px)·안쪽 여백(26px)·좌우 정렬이 같다.
원본에 없는 명시적 예시 진입 버튼은 남겨두므로 카드 시작 위치는 원본보다 60px 아래다.
상단 하늘색 시연 박스와 미조회 pill은 제거된 상태이며 본문과 비활성 select로 미조회를 전달한다.
권한 정보 펼침 간격은 12px, 닫을 때 정보 박스를 제거한다. 390px에서 scrollWidth=390,
하단 버튼은 좌우 18px 안에 있고 높이 49px로 정상 표시된다.
실제 추천·권한 승인이 아닌 시연 설명은 카드/상단 공통 모드 표시/하단 안내로 유지된다.


## Environment Claude Code MVP 대응 구현

- 기준: 최종 HTML/DOCX의 Codex 표시와 PRD의 Claude Code 중심 정책을 대조했다.
  Client 이름·버전 라벨·설정 대상 설명·지원 안내만 정책에 맞게 변경했다.
  06 카드 구조·진행 표시·OS/실행 환경/설치 구성요소/외부 인증 준비 상태·버튼·CSS는 유지한다.
- `clientDefinition.js`에 현재 MVP 식별자와 Client별 표시 문구를 분리했다.
  `CLAUDE_CODE`는 UI 내부 식별자이며 서버 enum을 확정한 것이 아니다.
  `clientVersion`은 사용자가 알고 있는 버전 문자열로 기존 선택 입력·200 코드포인트 검증을 유지한다.
  버전 자동 조회·지원 범위 판정·설치 확인·설정 내용 수집은 없다.
- `configurationKnowledge`의 UNKNOWN/USER_SAYS_EMPTY/HAS_EXISTING는 사용자가 알고 있는
  **Claude Code 설정 존재 여부**다. 특정 JSON 파일·권한 모드·모든 설정 범위의 실효 상태에 매핑하지 않는다.
  [공식 설정 문서](https://code.claude.com/docs/en/settings)는 사용자/프로젝트/로컬/관리 범위와 우선순위를 구분하므로
  ‘설정 있음’만으로 실제 적용·상위 정책·도구 권한을 판정할 수 없다.
  [공식 설치 문서](https://code.claude.com/docs/en/setup)의 설치 지원과 AgentFit 검증 지원 범위도 동일시하지 않는다.
- 신규 시연 entry와 마지막 확인 value에 Client 식별자를 함께 기록한다. 서버 데이터는 여전히 별도이며
  service 모드 입력 UI는 인증·API 미연동 안내로 차단한다. null/[]/목록 의미는 변경하지 않는다.
- 구버전 메모리 entry에는 Client 식별자가 없었다. 기존 Codex 버전/설정 선언을 `legacyClientInput`에
  별도 보존하고 Claude Code 초안은 빈 버전/UNKNOWN으로 시작한다. OS·공통 목록·초안은 그대로다.
  마지막 유효 value는 확인 전 덮어쓰지 않고 confirmed를 해제한다. Claude 값을 재확인해야 추천 시연으로 이동한다.
  이 처리는 구버전 demo 메모리 전용이며 서버 데이터 마이그레이션·영구 저장이 아니다.
  명시적인 다른 Client 식별자는 자동 변환하지 않고 입력 화면을 차단한다.
- Codex 후속 지원은 정의 파일의 표시 문구와 별도 Client 입력/계약을 확장해 연결한다.
  현재 Client 전환 selector·설정 파서·권한 어댑터를 만들지 않는다.

### 남은 계약·디자인 결정

1. Claude Code의 AgentFit 지원 OS/버전, 서버 Client 식별자, 버전 형식 및 저장 계약.
2. 설정 존재 여부의 범위와 출처, 사용자/프로젝트/관리 설정 확인 방식, Secret 정제·충돌 검증.
3. Selection(08)은 여전히 추상 시연이다. 실제 manifest 권한·승인 정책을 Claude 규칙/모드와
   단순 매핑하지 않는다. Catalog/추천 snapshot/호환성/도구별 권한 계약과 디자인 확정 필요.
4. Preview(09)·다운로드(10)는 미구현이다. Claude 전용 파일 종류·경로·범위·병합/Diff·기준 버전·
   최종 승인 fingerprint·산출물 일치·적용/인증/확인 안내를 합의해야 한다. 이번에 파일 생성·적용은 하지 않았다.
5. 앞의 Client 전환 표에서 Environment 수정은 이번에 반영됐고, 07~10의 실제 API/권한/산출물 항목은 후속 과제다.
