"use client"

import { useState } from "react"
import { Project } from "@/lib/mock-db"
import { FullWorkLog } from "@/actions/worklogs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Activity, AlertCircle, Box } from "lucide-react"
import { ProjectStatusEditor } from "./ProjectStatusEditor"
import { AddProjectButton } from "./AddProjectButton"
import { ActivityFeedItem } from "./ActivityFeedItem"
import { useUser } from "@/components/providers/UserProvider"

interface DashboardClientProps {
  projects: Project[]
  workLogs: FullWorkLog[]
}

export function DashboardClient({ projects, workLogs }: DashboardClientProps) {
  const { userProjectId, isAdmin } = useUser()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(userProjectId === 'admin' ? null : userProjectId)

  const selectedProject = projects.find(p => p.id === selectedProjectId)
  const filteredLogs = selectedProjectId 
    ? workLogs.filter(log => log.project_id === selectedProjectId)
    : []

  return (
    <div className={`grid grid-cols-1 gap-8 items-start duration-500 animate-in fade-in ${selectedProjectId ? 'lg:grid-cols-2' : 'max-w-4xl mx-auto'}`}>
      {/* 왼쪽: 팀별 프로젝트 현황 (프로젝트 목록) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-indigo-600" />
              팀별 프로젝트 현황
            </div>
            {isAdmin && <AddProjectButton />}
          </CardTitle>
          <CardDescription>진행 중인 프로젝트를 클릭하여 세부 활동 피드를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {projects.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-muted-foreground text-sm">등록된 프로젝트가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id} onClick={() => setSelectedProjectId(project.id)}>
                  <ProjectStatusEditor project={project} isSelected={selectedProjectId === project.id} isAdmin={isAdmin} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 오른쪽: 선택된 프로젝트의 활동 피드 (선택되었을 때만 노출) */}
      {selectedProjectId && (
        <Card className="shadow-sm border-slate-200 animate-in slide-in-from-right-8 fade-in duration-500">
          <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-emerald-600" />
                {selectedProject ? `'${selectedProject.title}' 활동 피드` : '선택된 프로젝트 없음'}
              </CardTitle>
              <CardDescription className="mt-1.5">
                해당 프로젝트의 작업 로그와 실시간 댓글입니다.
              </CardDescription>
            </div>
            <button onClick={() => setSelectedProjectId(null)} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition">
              닫기
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium">활동 내역이 없습니다.</p>
                <p className="text-slate-400 text-sm mt-1">이 프로젝트에 작성된 워크로그가 아직 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredLogs.map((log) => (
                  <ActivityFeedItem key={log.id} log={log} project={selectedProject} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
