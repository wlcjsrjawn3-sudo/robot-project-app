"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { HardHat, LayoutDashboard, Database, Wrench, Users, LogOut } from "lucide-react"
import { useUser } from "@/components/providers/UserProvider"

export function Navigation() {
  const pathname = usePathname()
  const { isAdmin, userName, logout } = useUser()

  const routes = [
    {
      href: "/",
      label: "대시보드",
      icon: LayoutDashboard,
      active: pathname === "/"
    },
    {
      href: "/worklogs",
      label: "워크로그",
      icon: HardHat,
      active: pathname === "/worklogs"
    },
    {
      href: "/resources",
      label: "비품 신청 및 관리",
      icon: Database,
      active: pathname === "/resources"
    },
    ...(isAdmin ? [{
      href: "/users",
      label: "회원관리",
      icon: Users,
      active: pathname === "/users"
    }] : [])
  ]

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Wrench className="w-6 h-6" />
            <span>로봇설계 PM</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                  )}
                >
                  <route.icon className="w-4 h-4" />
                  {route.label}
                </Link>
              ))}
            </div>

            {/* 사용자 프로필 및 로그아웃 영역 */}
            {userName && (
              <div className="flex items-center gap-3 border-l pl-6">
                <div className="text-sm font-medium text-slate-700">
                  {isAdmin ? (
                    <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md font-semibold text-xs tracking-tight">관리자 권한</span>
                  ) : (
                    <span>{userName} <span className="text-slate-400 font-normal">학생</span></span>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    logout()
                  }}
                  className="p-2 text-slate-400 hover:text-rose-500 bg-white hover:bg-rose-50 border border-slate-200 rounded-md transition duration-200 cursor-pointer shadow-sm active:scale-95"
                  title="로그아웃 및 계정 초기화 (클릭)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
