"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Project } from "@/lib/mock-db"
import { getProjects } from "@/actions/projects"
import { upsertUser, getUser, authenticateStudent } from "@/actions/users"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type UserContextType = {
  userName: string | null
  userProjectId: string | null
  isAdmin: boolean
  setUserData: (name: string, projectId: string) => void
  projects: Project[]
  logout: () => void
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState<string | null>(null)
  const [userProjectId, setUserProjectId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isReady, setIsReady] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [isSetupAdmin, setIsSetupAdmin] = useState(false)
  const [inputName, setInputName] = useState("")
  const [studentPin, setStudentPin] = useState("")
  const [selectProjectId, setSelectProjectId] = useState("")
  const [adminPin, setAdminPin] = useState("")

  useEffect(() => {
    const fetchWrapper = async () => {
       const prjs = await getProjects()
       setProjects(prjs)
       
       const savedId = localStorage.getItem("rpm_userId")
       const savedName = localStorage.getItem("rpm_userName")
       const savedProject = localStorage.getItem("rpm_userProjectId")
       const savedAdmin = localStorage.getItem("rpm_isAdmin") === "true"
       
       if (savedId) {
         try {
           const serverUser = await getUser(savedId)
           if (serverUser) {
             setUserName(serverUser.name)
             setInputName(serverUser.name)
             if (serverUser.project_id && serverUser.project_id !== "admin") {
               setUserProjectId(serverUser.project_id)
               setSelectProjectId(serverUser.project_id)
               localStorage.setItem("rpm_userProjectId", serverUser.project_id)
             }
             localStorage.setItem("rpm_userName", serverUser.name)
             if (serverUser.role === 'admin') {
               setIsAdmin(true)
               setUserProjectId("admin")
               localStorage.setItem("rpm_isAdmin", "true")
             }
           } else {
             // If user was deleted remotely, sign out locally
             localStorage.removeItem("rpm_userId")
             localStorage.removeItem("rpm_userName")
             localStorage.removeItem("rpm_userProjectId")
             localStorage.removeItem("rpm_isAdmin")
           }
         } catch (e) {
             if (savedName) { setUserName(savedName); setInputName(savedName) }
             if (savedProject && savedProject !== "admin") { setUserProjectId(savedProject); setSelectProjectId(savedProject) }
             if (savedAdmin) { setIsAdmin(true); setUserProjectId("admin") }
         }
       } else {
         if (savedName) { setUserName(savedName); setInputName(savedName) }
         if (savedProject && savedProject !== "admin") { setUserProjectId(savedProject); setSelectProjectId(savedProject) }
         if (savedAdmin) { setIsAdmin(true); setUserProjectId("admin") }
       }
       
       setIsReady(true)
    }
    fetchWrapper()
  }, [])

  const logout = () => {
    localStorage.removeItem("rpm_userId")
    localStorage.removeItem("rpm_userName")
    localStorage.removeItem("rpm_userProjectId")
    localStorage.removeItem("rpm_isAdmin")
    
    // 완벽한 모달 팝업을 보장하기 위해 브라우저 강제 새로고침 (React 상태 꼬임 방지)
    if (window.location.pathname === "/") {
      window.location.reload()
    } else {
      window.location.href = "/"
    }
  }

  const handleSaveStudent = async () => {
    if (!inputName.trim() || !selectProjectId || !studentPin || studentPin.length < 4) return
    setIsSaving(true)

    try {
      const newId = await authenticateStudent(inputName, studentPin, selectProjectId)
      
      localStorage.setItem("rpm_userId", newId)
      localStorage.setItem("rpm_userName", inputName)
      localStorage.setItem("rpm_userProjectId", selectProjectId)
      localStorage.setItem("rpm_isAdmin", "false")
      
      setUserName(inputName)
      setUserProjectId(selectProjectId)
      setIsAdmin(false)
      setIsSaving(false)
    } catch (err: any) {
      setIsSaving(false)
      if (err.message === "PIN_MISMATCH") {
        alert("개인 식별 번호가 일치하지 않습니다. 처음 등록했던 4자리 숫자를 입력해주세요.")
      } else {
        alert("로그인 중 오류가 발생했습니다: " + err.message)
      }
    }
  }

  const handleSaveAdmin = async () => {
    if (adminPin !== "5954") {
      alert("관리자 비밀번호가 틀렸습니다.")
      return
    }
    setIsSaving(true)
    const existingId = localStorage.getItem("rpm_userId")
    const newId = await upsertUser({ id: existingId || undefined, name: "관리자 (선생님)", project_id: "admin", role: "admin" })
    
    localStorage.setItem("rpm_userId", newId)
    localStorage.setItem("rpm_userName", "관리자 (선생님)")
    localStorage.setItem("rpm_userProjectId", "admin")
    localStorage.setItem("rpm_isAdmin", "true")
    setUserName("관리자 (선생님)")
    setUserProjectId("admin")
    setIsAdmin(true)
    setIsSaving(false)
  }

  // Prevent flashing logic or errors during SSR
  if (!isReady) return null

  const needsSetup = !userName || (!userProjectId && !isAdmin)

  return (
    <UserContext.Provider value={{ userName, userProjectId, isAdmin, setUserData: (n, p) => { setUserName(n); setUserProjectId(p) }, projects, logout }}>
      {!needsSetup && children}

      <Dialog open={needsSetup}>
        <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-900 pb-2">로봇설계 PM 시작하기</DialogTitle>
            <DialogDescription className="text-center text-sm md:text-base mb-1">
              접속할 계정 유형을 선택해주세요.
            </DialogDescription>
          </DialogHeader>

          <div className="flex bg-slate-100 p-1.5 rounded-lg mb-2 shadow-inner">
            <button onClick={() => setIsSetupAdmin(false)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isSetupAdmin ? 'bg-white shadow border border-slate-200 text-indigo-700 scale-100' : 'text-slate-500 hover:text-slate-800 scale-[0.98]'}`}>
              학생 접속
            </button>
            <button onClick={() => setIsSetupAdmin(true)} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isSetupAdmin ? 'bg-indigo-600 shadow text-white scale-100' : 'text-slate-500 hover:text-slate-800 scale-[0.98]'}`}>
              선생님 (관리자)
            </button>
          </div>

          {!isSetupAdmin ? (
            <>
              <div className="grid gap-4 py-3">
                <div className="space-y-2">
                  <Label htmlFor="setup-name">이름 (팀원)</Label>
                  <Input id="setup-name" placeholder="예: 김로봇" value={inputName} onChange={e => setInputName(e.target.value)} className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-pin">개인 식별 번호 (숫자 4자리)</Label>
                  <Input id="setup-pin" type="password" maxLength={4} placeholder="예: 1234" value={studentPin} onChange={e => setStudentPin(e.target.value.replace(/[^0-9]/g, ''))} className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-select">진행할 프로젝트 (소속 팀)</Label>
                  <select 
                    id="project-select"
                    value={selectProjectId} 
                    onChange={(e) => setSelectProjectId(e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled hidden>참여 중인 프로젝트 선택</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} (리더: {p.leader_name})</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={handleSaveStudent} disabled={!inputName.trim() || !selectProjectId || studentPin.length < 4 || isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base shadow-md">
                {isSaving ? "설정 중..." : "설정 완료 및 시작"}
              </Button>
            </>
          ) : (
            <>
              <div className="grid gap-4 py-3">
                <div className="space-y-2">
                  <Label htmlFor="admin-pin">관리자 비밀번호 (PIN)</Label>
                  <Input id="admin-pin" type="password" placeholder="비밀번호 입력" value={adminPin} onChange={e => setAdminPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveAdmin()} className="bg-slate-50 border-slate-200 focus-visible:ring-indigo-500" />
                </div>
              </div>
              <Button onClick={handleSaveAdmin} disabled={!adminPin || isSaving} className="w-full bg-slate-800 hover:bg-slate-900 h-11 text-base shadow-md">
                {isSaving ? "인증 중..." : "관리자 고유 권한으로 로그인"}
              </Button>
            </>
          )}

        </DialogContent>
      </Dialog>
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
