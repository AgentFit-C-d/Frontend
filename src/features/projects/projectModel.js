// This store contains demo data only. Server data belongs in a separate API-backed store.
export const initialDemoState = { active: false, projects: [], draftName: '', examplesVisible: false, selectedProjectId: null }

const exampleProjects = [
  { id: 'demo-example-workout', name: '운동 기록 웹 서비스', source: 'demo' },
  { id: 'demo-example-planner', name: '팀 일정 관리 서비스', source: 'demo' },
]

export function getVisibleProjects(state) {
  return state.examplesVisible ? [...state.projects, ...exampleProjects] : state.projects
}

export const limitProjectName = (value) => Array.from(value).slice(0, 200).join('')

export function validateProjectName(value) {
  if (!value.trim()) return '프로젝트 이름을 입력해주세요.'
  if (Array.from(value).length > 200) return '프로젝트 이름은 최대 200자까지 입력할 수 있어요.'
  return ''
}

export function demoReducer(state, action) {
  switch (action.type) {
    case 'enter':
      return { ...initialDemoState, active: true }
    case 'exit':
      return initialDemoState
    case 'cancel':
      return { ...state, draftName: '' }
    case 'draft':
      return { ...state, draftName: limitProjectName(action.value) }
    case 'create':
      if (!state.active || validateProjectName(action.name)) return state
      return {
        ...state,
        draftName: '',
        selectedProjectId: action.id,
        projects: [{ id: action.id, name: action.name.trim(), source: 'demo' }, ...state.projects],
      }
    case 'select':
      return state.active && getVisibleProjects(state).some(project => project.id === action.id)
        ? { ...state, selectedProjectId: action.id }
        : state
    case 'examples': {
      if (!state.active) return state
      const examplesVisible = !state.examplesVisible
      const selectedExample = exampleProjects.some(project => project.id === state.selectedProjectId)
      return { ...state, examplesVisible, selectedProjectId: !examplesVisible && selectedExample ? null : state.selectedProjectId }
    }
    default:
      return state
  }
}
