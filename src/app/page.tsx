import { getProjects } from "@/actions/projects"
import { getWorkLogs } from "@/actions/worklogs"
import { DashboardClient } from "@/components/dashboard/DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [projects, workLogs] = await Promise.all([
    getProjects(),
    getWorkLogs()
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">대시보드</h1>
        <p className="text-muted-foreground mt-1">팀별 프로젝트 현황과 실시간 워크로그 활동을 확인하세요.</p>
      </div>

      <DashboardClient projects={projects} workLogs={workLogs} />
    </div>
  )
}
