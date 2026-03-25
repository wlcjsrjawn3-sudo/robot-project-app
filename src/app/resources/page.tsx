import { getResources } from "@/actions/resources"
import { ResourceForm } from "@/components/resources/ResourceForm"
import { ResourceList } from "@/components/resources/ResourceList"

export const dynamic = "force-dynamic"

export default async function ResourcesPage() {
  const resources = await getResources()

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">비품 신청 및 관리</h1>
        <p className="text-muted-foreground mt-1">학생은 필요한 비품을 신청하고, 관리자(선생님)는 신청 내역을 관리합니다.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* 비품 신청 폼 */}
        <div className="lg:col-span-1">
          <ResourceForm />
        </div>

        {/* 비품 목록 */}
        <div className="lg:col-span-2 space-y-4">
          <ResourceList resources={resources} />
        </div>
      </div>
    </div>
  )
}
