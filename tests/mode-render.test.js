import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { createServer } from 'vite'
import { createDemoProfile } from '../src/features/profile/profileModel.js'
import { demoReducer, initialDemoState } from '../src/features/projects/projectModel.js'

let server, AnalysisScreen, ProfileEditor, DemoContext
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' })
  ;({ AnalysisScreen } = await server.ssrLoadModule('/src/pages/AnalysisPage.jsx'))
  ;({ ProfileEditor } = await server.ssrLoadModule('/src/pages/ProfileReviewPage.jsx'))
  ;({ DemoContext } = await server.ssrLoadModule('/src/features/projects/DemoContext.js'))
})
after(async () => { await server?.close() })
const project = { id: 'a', name: '사용자 프로젝트' }
const render = element => renderToStaticMarkup(h(MemoryRouter, null, element))

test('Analysis 실제 렌더링에서 시연 진입은 demo에만 보이고 결과 버튼은 비활성이다', () => {
  for (const mode of ['demo', 'service']) {
    const html = render(h(AnalysisScreen, { project, planningPath: '/demo/projects/a', mode, status: 'unavailable', onPreview() {} }))
    assert.match(html, /disabled=""/)
    if (mode === 'demo') assert.match(html, /시연용 Profile 편집 화면 미리보기/)
    else {
      assert.doesNotMatch(html, /시연|fixture|연결 전|미리보기/)
      assert.match(html, /분석 서비스를 이용할 수 없어요/)
    }
  }
})

test('Profile 렌더링의 예시 불러오기는 demo에만 표시하고 서비스에 demo 데이터 유입을 거부한다', () => {
  const entry = createDemoProfile(project.name)
  const view = (mode, data) => render(h(DemoContext.Provider, { value: { dispatch() {} } }, h(ProfileEditor, { mode, project, entry: data })))
  assert.match(view('demo', entry), /예시 데이터 불러오기/)
  assert.doesNotMatch(view('demo', entry), /예시 팀 일정 서비스/)
  // A supplied server-shaped value tests presentation only; no API/session is simulated.
  const service = view('service', { ...entry, source: 'server' })
  assert.doesNotMatch(service, /시연|fixture|메모리에|예시 데이터 불러오기|예시 팀 일정 서비스/)
  const rejected = view('service', createDemoProfile('', true))
  assert.match(rejected, /서버에서 확인한 프로젝트 정보가 필요합니다/)
  assert.doesNotMatch(rejected, /예시 팀 일정 서비스|<form/)
})

test('시연 진입·프로필 확인은 분석 완료 상태를 만들지 않고 인증 관련 action도 상태를 바꾸지 않는다', () => {
  let state = demoReducer(initialDemoState, { type: 'enter' })
  state = demoReducer(state, { type: 'create', id: 'a', name: 'A' })
  state = demoReducer(state, { type: 'profile-preview', id: 'a' })
  state = demoReducer(state, { type: 'profile-edit', id: 'a', edit: 'confirm' })
  assert.equal(state.demoProfiles.a.confirmed, true)
  assert.equal(Object.hasOwn(state, 'analysisStatus'), false)
  assert.equal(demoReducer(state, { type: 'oauth-success' }), state)
  assert.equal(demoReducer(state, { type: 'analysis-completed' }), state)
})
