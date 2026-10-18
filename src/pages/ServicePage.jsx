import { useLoaderData, useNavigation, useParams } from 'react-router'
import Brand from '../components/layout/Brand.jsx'
import PageHeader from '../components/layout/PageHeader.jsx'
import { Button, Card } from '../components/ui/UI.jsx'
import { containsDemoData, isAuthenticatedSession } from '../features/service/serviceModel.js'
import styles from './ServicePage.module.css'

const messages = {
  loading: ['정보를 불러오고 있어요', '잠시만 기다려주세요.'],
  empty: ['표시할 정보가 없어요', '아직 등록된 정보가 없습니다.'],
  unavailable: ['지금은 이 기능을 이용할 수 없어요', '잠시 후 다시 이용해주세요.'],
  error: ['정보를 불러오지 못했어요', '잠시 후 다시 시도해주세요.'],
  'not-found': ['요청한 정보를 찾을 수 없어요', '프로젝트 목록에서 다시 확인해주세요.'],
  forbidden: ['이 정보에 접근할 수 없어요', '사용 가능한 계정과 프로젝트를 확인해주세요.'],
}
export function ServiceResourceState({ result }) {
  const status = containsDemoData(result) || ['ready', 'empty'].includes(result?.status) && result.source !== 'server' ? 'error' : result?.status
  // Ready DTOs must be connected to server-backed forms before enabling a service action.
  const [title, description] = messages[status] || messages.unavailable
  return <Card padded role="status" aria-busy={status === 'loading'}><h2>{title}</h2><p>{description}</p></Card>
}
export function ServiceLoading() {
  return <main className={styles.shell}><Brand /><ServiceResourceState result={{ status: 'loading' }} /></main>
}
export function ServiceScreen({ stage, auth, resource }) {
  const authenticated = isAuthenticatedSession(auth)
  return <main className={styles.shell}>
    <header className={styles.header}><Brand /><Button to="/login">로그인 화면으로</Button></header>
    {!authenticated ? <Card padded role="status"><h1>{auth?.status === 'unauthenticated' ? '로그인이 필요해요' : '지금은 로그인 서비스를 이용할 수 없어요'}</h1><p>{auth?.status === 'unauthenticated' ? '로그인 후 다시 이용해주세요.' : '잠시 후 다시 시도해주세요.'}</p><Button to="/login">로그인 화면으로</Button></Card> : <>
      <PageHeader title={stage.title} description="프로젝트 정보를 확인해주세요." />
      <ServiceResourceState result={resource} />
      {stage.key !== 'projects' && <div className={styles.actions}><Button to="/app/projects">내 프로젝트로</Button></div>}
    </>}
  </main>
}
export default function ServicePage({ stage }) {
  const data = useLoaderData()
  const navigation = useNavigation()
  const { projectId } = useParams()
  if (navigation.state !== 'idle' || data.projectId !== (projectId ?? null)) return <ServiceLoading />
  return <ServiceScreen stage={stage} auth={data.auth} resource={data.resource} />
}
