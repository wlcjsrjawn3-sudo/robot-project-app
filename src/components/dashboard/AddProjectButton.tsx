"use client"

import { useState } from "react"
import { addProject } from "@/actions/projects"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddProjectButton() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [leaderName, setLeaderName] = useState("")
  const [teamMembers, setTeamMembers] = useState("")
  const [status, setStatus] = useState("계획")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!title || !leaderName) {
      toast.error("프로젝트명과 리더 이름을 입력해주세요.")
      return
    }

    setIsAdding(true)
    try {
      await addProject({ title, leader_name: leaderName, team_members: teamMembers, status, progress: 0 })
      toast.success("새 프로젝트가 추가되었습니다.")
      setOpen(false)
      setTitle("")
      setLeaderName("")
      setTeamMembers("")
      setStatus("계획")
    } catch (err) {
      toast.error("프로젝트 추가에 실패했습니다.")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-1">
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">새 프로젝트</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 프로젝트 추가</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 생성하여 팀의 공정을 관리하세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">프로젝트명</Label>
            <Input id="title" placeholder="예: 무인 운반차(AGV) 개발" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leader">리더 (담당자) 이름</Label>
            <Input id="leader" placeholder="예: 김로봇" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-members">팀원 (쉼표로 구분)</Label>
            <Input id="team-members" placeholder="예: 이코딩, 박설계" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="init-status">초기 공정 단계</Label>
            <Input id="init-status" placeholder="예: 계획, 조사 등" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAdd} disabled={isAdding} className="bg-blue-600 hover:bg-blue-700">
            {isAdding ? "추가 중..." : "프로젝트 생성"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
