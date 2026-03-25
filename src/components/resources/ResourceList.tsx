"use client"

import { Resource } from "@/lib/mock-db"
import { updateResourceStatus, deleteResource } from "@/actions/resources"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, CheckCircle, XCircle, Package, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useState } from "react"
import { useUser } from "@/components/providers/UserProvider"

export function ResourceList({ resources }: { resources: Resource[] }) {
  const { isAdmin } = useUser()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("이 비품 신청 내역을 영구적으로 삭제하시겠습니까? (이 작업은 복구할 수 없습니다)")) return
    setIsUpdating(id)
    try {
      await deleteResource(id)
      toast.success("비품 신청 내역이 삭제되었습니다.")
    } catch (err) {
      toast.error("삭제에 실패했습니다.")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: Resource['status']) => {
    setIsUpdating(id)
    try {
      await updateResourceStatus(id, newStatus)
      toast.success(`상태가 '${newStatus}'(으)로 변경되었습니다.`)
    } catch (err) {
      toast.error("상태 변경에 실패했습니다.")
    } finally {
      setIsUpdating(null)
    }
  }

  const getStatusBadge = (status: Resource['status']) => {
    switch(status) {
      case '신청': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">신청</Badge>
      case '승인': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">승인</Badge>
      case '반려': return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">반려</Badge>
      case '지급': return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">지급 완료</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        신청 내역 {isAdmin && <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">관리자 대시보드</span>}
      </h2>
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead>품명</TableHead>
            <TableHead>구입처</TableHead>
            <TableHead className="text-right">수량</TableHead>
            <TableHead className="text-right">예상 단가</TableHead>
            <TableHead className="text-right">총액</TableHead>
            <TableHead className="text-center">상태</TableHead>
            {isAdmin && <TableHead className="text-center">관리 (선생님)</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="h-32 text-center text-muted-foreground font-medium">
                신청된 비품 내역이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            resources.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.item_name}</TableCell>
                <TableCell>
                  <a href={res.purchase_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                    링크 이동 <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
                <TableCell className="text-right">{res.quantity}</TableCell>
                <TableCell className="text-right">{res.estimated_price.toLocaleString()}원</TableCell>
                <TableCell className="text-right font-semibold">{(res.quantity * res.estimated_price).toLocaleString()}원</TableCell>
                <TableCell className="text-center">{getStatusBadge(res.status)}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex justify-center gap-2">
                        {res.status === '신청' && (
                          <>
                            <Button size="sm" variant="outline" className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50 px-2" onClick={() => handleStatusUpdate(res.id, '승인')} disabled={isUpdating === res.id}>
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> 승인
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-700 hover:bg-red-50 px-2" onClick={() => handleStatusUpdate(res.id, '반려')} disabled={isUpdating === res.id}>
                              <XCircle className="w-3.5 h-3.5 mr-1" /> 반려
                            </Button>
                          </>
                        )}
                        {res.status === '승인' && (
                          <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 px-2" onClick={() => handleStatusUpdate(res.id, '지급')} disabled={isUpdating === res.id}>
                            <Package className="w-3.5 h-3.5 mr-1" /> 지급 처리
                          </Button>
                        )}
                        {(res.status === '반려' || res.status === '지급') && (
                          <span className="text-xs text-slate-400 font-medium whitespace-nowrap px-4 py-2 border rounded-md bg-slate-50">처리 완료</span>
                        )}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0" onClick={() => handleDelete(res.id)} disabled={isUpdating === res.id} title="해당 내역 완전 삭제">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </div>
  )
}
