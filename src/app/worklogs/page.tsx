import { getProjects } from "@/actions/projects"
import { getWorkLogs } from "@/actions/worklogs"
import { WorkLogForm } from "@/components/worklogs/WorkLogForm"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Box } from "lucide-react"
import { ActivityFeedItem } from "@/components/dashboard/ActivityFeedItem"

export const dynamic = "force-dynamic"

export default async function WorkLogsPage() {
  const [projects, workLogs] = await Promise.all([
    getProjects(),
    getWorkLogs()
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">지능형 워크로그</h1>
        <p className="text-muted-foreground mt-1">작업 내역을 기록하면 AI가 사진에서 핵심 태그를 추출해줍니다.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 워크로그 작성 폼 */}
        <div>
          <WorkLogForm projects={projects} />
        </div>

        {/* 워크로그 히스토리 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            최근 워크로그 히스토리
          </h2>
          {workLogs.length === 0 ? (
            <Card className="border-dashed shadow-none bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <Box className="w-10 h-10 mb-3 opacity-20" />
                <p>작성된 워크로그가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log) => {
                const project = projects.find(p => p.id === log.project_id)
                return (
                  <Card key={log.id} className="shadow-sm border-slate-200">
                    <CardContent className="p-5">
                      <ActivityFeedItem log={log} project={project} />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
