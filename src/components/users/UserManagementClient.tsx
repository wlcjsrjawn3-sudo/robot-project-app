"use client"

import { useState } from "react"
import { AppUser, Project } from "@/lib/mock-db"
import { upsertUser, deleteUser } from "@/actions/users"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Save, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/components/providers/UserProvider"
import { useRouter } from "next/navigation"

export function UserManagementClient({ initialUsers, projects }: { initialUsers: AppUser[], projects: Project[] }) {
  const { isAdmin } = useUser()
  const router = useRouter()
  const [users, setUsers] = useState<AppUser[]>(initialUsers)

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-500">
        <UserIcon className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">접근 권한 없음</h2>
        <p className="text-slate-500 mt-2">이 페이지는 관리자(선생님) 전용 회원관리 메뉴입니다.</p>
      </div>
    )
  }

  const handleUpdate = async (id: string, name: string, project_id: string, role: 'student'|'admin', pin?: string) => {
    try {
      await upsertUser({ id, name, project_id, role, pin })
      toast.success(`'${name}' 님의 정보가 업데이트되었습니다.`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, name, project_id, pin } : u))
      router.refresh()
    } catch (e) {
      toast.error("업데이트 실패")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`'${name}' 사용자를 관리 시스템에서 완전히 삭제하시겠습니까?\n삭제 시 해당 학생은 다음 접속 시 다시 이름과 프로젝트를 등록해야 합니다.`)) return
    try {
      await deleteUser(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success("사용자가 삭제되었습니다.")
      router.refresh()
    } catch (e) {
      toast.error("삭제 실패")
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-indigo-600" />
          회원 관리
        </h1>
        <p className="text-muted-foreground mt-2">학생들의 가입 현황을 한눈에 확인하고, 이름을 수정하거나 잘못된 팀(프로젝트) 소속을 변경할 수 있습니다.</p>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm w-full overflow-x-auto">
        <table className="w-full caption-bottom text-sm border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="h-12 px-6 text-left align-middle font-semibold text-slate-700 w-[100px]">권한 역할</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-slate-700">이름</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-slate-700">개인 식별 번호</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-slate-700">소속 팀 (프로젝트)</th>
              <th className="h-12 px-6 text-left align-middle font-semibold text-slate-700">최초 가입일</th>
              <th className="h-12 px-6 text-right align-middle font-semibold text-slate-700">관리 (저장 / 삭제)</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-32 text-center text-slate-400">
                  가입한 사용자가 아직 없습니다. 최초 접속 시 온보딩을 진행하면 이 곳에 표시됩니다.
                </td>
              </tr>
            ) : (
              [...users].sort((a, b) => {
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (a.role !== 'admin' && b.role === 'admin') return 1;
                if (a.role === 'admin' && b.role === 'admin') {
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                }
                return a.name.localeCompare(b.name, 'ko-KR');
              }).map(u => (
                <UserRow key={u.id} user={u} projects={projects} onUpdate={handleUpdate} onDelete={handleDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UserRow({ user, projects, onUpdate, onDelete }: { user: AppUser, projects: Project[], onUpdate: any, onDelete: any }) {
  const [name, setName] = useState(user.name)
  const [pin, setPin] = useState(user.pin || "")
  const [projectId, setProjectId] = useState(user.project_id)
  const isChanged = name !== user.name || projectId !== user.project_id || pin !== (user.pin || "")

  return (
    <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/50">
      <td className="p-4 px-6 align-middle">
        <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}>
          {user.role === 'admin' ? '관리자' : '일반 학생'}
        </Badge>
      </td>
      <td className="p-4 px-6 align-middle">
        {user.role === 'admin' ? (
           <span className="font-semibold text-slate-600">{user.name}</span>
        ) : (
           <Input value={name} onChange={e => setName(e.target.value)} className="h-9 w-full max-w-[160px] bg-white border-slate-200" />
        )}
      </td>
      <td className="p-4 px-6 align-middle">
        {user.role === 'admin' ? (
           <span className="font-semibold text-slate-400">-</span>
        ) : (
           <Input value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} maxLength={4} placeholder="4자리" className="h-9 w-20 text-center bg-white border-slate-200 px-1" />
        )}
      </td>
      <td className="p-4 px-6 align-middle">
        {user.role === 'admin' ? (
           <span className="text-sm font-medium text-slate-400">모든 프로젝트 자유 접근 및 관리</span>
        ) : (
          <select 
            value={projectId} 
            onChange={e => setProjectId(e.target.value)}
            className="flex h-9 w-full max-w-[280px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title} (리더: {p.leader_name})</option>
            ))}
          </select>
        )}
      </td>
      <td className="p-4 px-6 align-middle text-sm text-slate-500 whitespace-nowrap">
        {new Date(user.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </td>
      <td className="p-4 px-6 align-middle text-right space-x-2">
        {user.role !== 'admin' && (
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant={isChanged ? "default" : "outline"} onClick={() => onUpdate(user.id, name, projectId, user.role, pin)} disabled={!isChanged} className={isChanged ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20" : ""}>
              <Save className="w-4 h-4 mr-1.5" /> 저장
            </Button>
            <Button size="icon" variant="outline" className="h-9 w-9 text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors" onClick={() => onDelete(user.id, user.name)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  )
}
