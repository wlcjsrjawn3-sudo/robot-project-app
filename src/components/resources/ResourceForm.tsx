"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addResource } from "@/actions/resources"
import { toast } from "sonner"
import { ShoppingCart } from "lucide-react"

export function ResourceForm() {
  const [itemName, setItemName] = useState("")
  const [purchaseUrl, setPurchaseUrl] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!itemName || !purchaseUrl || quantity < 1 || !estimatedPrice) {
      toast.error("모든 필드를 올바르게 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      await addResource({
        item_name: itemName,
        purchase_url: purchaseUrl,
        quantity: typeof quantity === 'number' ? quantity : parseInt(quantity, 10),
        estimated_price: parseInt(estimatedPrice.replace(/[^0-9]/g, ""), 10) || 0
      })
      toast.success("비품 신청이 완료되었습니다.")
      setItemName("")
      setPurchaseUrl("")
      setQuantity(1)
      setEstimatedPrice("")
    } catch (err) {
      toast.error("비품 신청 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-600" />
          비품/부품 신청하기
        </CardTitle>
        <CardDescription>프로젝트 진행에 필요한 부품이나 공구를 신청하세요.</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item_name">품명</Label>
            <Input 
              id="item_name" 
              placeholder="예: 아두이노 우노 R3 호환보드" 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="purchase_url">구입 링크 (URL) <span className="text-red-500">*</span></Label>
            <Input 
              id="purchase_url" 
              type="url"
              placeholder="https://..." 
              value={purchaseUrl}
              onChange={(e) => setPurchaseUrl(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">수량</Label>
              <Input 
                id="quantity" 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_price">예상 단가 (원)</Label>
              <Input 
                id="estimated_price" 
                type="text"
                placeholder="15000"
                value={estimatedPrice}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "")
                  setEstimatedPrice(val ? parseInt(val, 10).toLocaleString() : "")
                }}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4 justify-end">
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
            {isSubmitting ? "신청 중..." : "신청하기"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
