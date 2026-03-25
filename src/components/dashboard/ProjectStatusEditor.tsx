"use client"

import { useState } from "react"
import { Project } from "@/lib/mock-db"
import { updateProject, deleteProject } from "@/actions/projects"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings2 } from "lucide-react"
import { toast } from "sonner"

export function ProjectStatusEditor({ project, isSelected = false, isAdmin = false }: { project: Project, isSelected?: boolean, isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(project.title)
  const [leaderName, setLeaderName] = useState(project.leader_name)
  const [teamMembers, setTeamMembers] = useState(project.team_members || "")
  const [status, setStatus] = useState(project.status)
  const [progress, setProgress] = useState(project.progress.toString())
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleUpdate = async () => {
    const progressNum = parseInt(progress, 10)
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      toast.error("진척도는 0에서 100 사이의 숫자여야 합니다.")
      return
    }

    setIsUpdating(true)
    try {
      await updateProject(project.id, { title, leader_name: leaderName, team_members: teamMembers, status, progress: progressNum })
      toast.success("프로젝트 상태가 업데이트되었습니다.")
      setOpen(false)
    } catch (err) {
      toast.error("업데이트에 실패했습니다.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      toast.success("프로젝트가 삭제되었습니다.")
      setOpen(false)
    } catch (err) {
      toast.error("삭제에 실패했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  // When dialog opens, reset to current DB values in case they were updated elsewhere
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTitle(project.title)
      setLeaderName(project.leader_name)
      setTeamMembers(project.team_members || "")
      setStatus(project.status)
      setProgress(project.progress.toString())
    }
    setOpen(newOpen)
  }

  return (
    <div className={`space-y-2 group relative p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600'}`}>
      <div className="flex items-center justify-between text-sm">
        <div className={`font-semibold flex items-center gap-2 ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
          {project.title}
          {/* stopPropagation prevents triggering the parent onClick which selects the project */}
          <div onClick={e => e.stopPropagation()}>
            {isAdmin && (
              <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-slate-200">
                  <Settings2 className="h-3.5 w-3.5 text-slate-500 hover:text-indigo-600" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>프로젝트 현황 수정 (관리자)</DialogTitle>
                    <DialogDescription>
                      '{project.title}' 프로젝트의 공정 단계와 진척도를 업데이트합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-title" className="text-right">프로젝트명</Label>
                      <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-leader" className="text-right">리더 이름</Label>
                      <Input id="edit-leader" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edit-team" className="text-right">팀원 명단</Label>
                      <Input id="edit-team" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} className="col-span-3" placeholder="쉼표로 구분" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">공정 단계</Label>
                      <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="col-span-3" placeholder="예: 설계, 가공, 테스트" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="progress" className="text-right">진척도 (%)</Label>
                      <Input id="progress" type="number" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter className="sm:justify-between items-center sm:flex-row-reverse gap-2">
                    <Button type="button" onClick={handleUpdate} disabled={isUpdating || isDeleting} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
                      {isUpdating ? "저장 중..." : "변경사항 저장"}
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleDelete} disabled={isUpdating || isDeleting} className="w-full sm:w-auto">
                      {isDeleting ? "삭제 중..." : "프로젝트 삭제"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="text-muted-foreground font-medium">{project.progress}%</div>
      </div>
      <Progress value={project.progress} className="h-2" />
      <div className="flex flex-col text-xs text-muted-foreground mt-1 gap-1">
        <div className="flex items-center justify-between">
          <span>리더: <span className="text-slate-700 font-medium">{project.leader_name}</span></span>
          <Badge variant="outline" className="bg-slate-100 text-slate-700">{project.status}</Badge>
        </div>
        {project.team_members && (
          <span className="text-[11px] text-slate-500 line-clamp-1">팀원: {project.team_members}</span>
        )}
      </div>
    </div>
  )
}
