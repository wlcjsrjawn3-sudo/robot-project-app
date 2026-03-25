"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { extractTagsFromImageBase64 } from "@/actions/ai"
import { addWorkLog } from "@/actions/worklogs"
import { Project } from "@/lib/mock-db"
import { useUser } from "@/components/providers/UserProvider"
import { toast } from "sonner"

export function WorkLogForm({ projects }: { projects: Project[] }) {
  const { userName, userProjectId } = useUser()
  const [projectId, setProjectId] = useState(userProjectId || projects[0]?.id || "")
  const [author, setAuthor] = useState(userName || "")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<{ url: string; tags: string[]; file: File }[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true)
    for (const file of acceptedFiles) {
      if (!file.type.startsWith("image/")) continue

      // Convert to base64 for display and AI extraction
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
      
      const base64 = await base64Promise
      
      // Call AI action to get tags
      try {
        toast.info("AI가 이미지를 분석하고 있습니다...")
        const tags = await extractTagsFromImageBase64(base64, file.type)
        
        setImages((prev) => [...prev, { url: base64, tags, file }])
        toast.success("이미지 분석 완료! 태그가 자동 추출되었습니다.")
      } catch (err) {
        toast.error("AI 태그 추출에 실패했습니다.")
        setImages((prev) => [...prev, { url: base64, tags: [], file }])
      }
    }
    setIsUploading(false)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }
  })

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId || !author || !content) {
      toast.error("필수 항목을 모두 입력해주세요.")
      return
    }

    try {
      // Collect all tags from images
      const allTags = Array.from(new Set(images.flatMap(img => img.tags)))
      
      // Submit log
      await addWorkLog({
        project_id: projectId,
        author,
        content,
        attachments: images.map(img => img.url),
        tags: allTags
      })
      
      toast.success("워크로그가 성공적으로 등록되었습니다.")
      setAuthor("")
      setContent("")
      setImages([])
    } catch (err) {
      toast.error("워크로그 등록 중 오류가 발생했습니다.")
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b pb-4">
        <CardTitle className="text-lg">새 워크로그 작성</CardTitle>
        <CardDescription>진행한 작업 내역과 사진을 공유하세요. AI가 사진에서 태그를 자동 추출합니다.</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>프로젝트</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">작성자명</Label>
              <Input 
                id="author" 
                placeholder="홍길동" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">작업 내용</Label>
            <Textarea 
              id="content" 
              placeholder="오늘 진행한 작업 내용을 상세하게 적어주세요." 
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> 
              첨부 이미지 (AI가 자동 분석합니다)
            </Label>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"}
                ${isUploading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                {isUploading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">AI가 이미지를 분석 중입니다...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 opacity-50 mb-2" />
                    <p className="text-sm font-medium">이미지를 이곳에 드래그하거나 클릭하여 업로드 (다중 선택 가능)</p>
                    <p className="text-xs">PNG, JPG, WEBP 지원</p>
                  </>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg border bg-white p-2 shadow-sm group">
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-90"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); removeImage(idx); }}
                      type="button"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <div className="aspect-video relative overflow-hidden rounded-md bg-slate-100 mb-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Uploaded preview" className="object-cover w-full h-full" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mb-1">
                        <Sparkles className="w-3 h-3 text-indigo-500 fill-indigo-100" /> AI 태그
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {img.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0 bg-indigo-50 text-indigo-700">
                            #{tag}
                          </Badge>
                        ))}
                        {img.tags.length === 0 && <span className="text-xs text-muted-foreground">태그 없음</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
          <Button type="submit" disabled={isUploading || !projectId}>워크로그 등록하기</Button>
        </CardFooter>
      </form>
    </Card>
  )
}
