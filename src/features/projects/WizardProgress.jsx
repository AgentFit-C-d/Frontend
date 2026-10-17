import styles from './WizardProgress.module.css'

const labels = ['프로젝트 생성', '기획 자료 입력', 'AI 기획 분석', '분석 내용 확인', '내 역할 입력', '개발환경 입력', 'Capability·추천', '도구·권한 선택', '설정 확인·승인', '다운로드·적용 안내']

export default function WizardProgress() {
  return <>
    <div className={styles.progress}><div className={styles.head}><b>1 / 10</b><span>프로젝트 생성</span></div><div className={styles.track} role="progressbar" aria-label="프로젝트 구성 진행" aria-valuemin={0} aria-valuemax={10} aria-valuenow={1}><span /></div></div>
    <ol className={styles.steps} aria-label="전체 진행 단계">
      {labels.map((label, i) => <li key={label} className={`${styles.step} ${i === 0 ? styles.current : ''}`} aria-current={i === 0 ? 'step' : undefined}><span className={styles.number}>{i + 1}</span><span className={styles.label}>{label}</span></li>)}
    </ol>
  </>
}
