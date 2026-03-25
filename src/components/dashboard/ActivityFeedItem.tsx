"use client"

import { useState } from "react"
import { FullWorkLog, addComment, updateWorkLog, deleteWorkLog } from "@/actions/worklogs"
import { Project, Comment } from "@/lib/mock-db"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { MessageCircle, ZoomIn, ZoomOut, RotateCcw, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useUser } from "@/components/providers/UserProvider"
import { toast } from "sonner"

function ImageZoomViewer({ url }: { url: string }) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale(prev => Math.min(prev + 0.5, 5))
  }
  
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale(prev => Math.max(prev - 0.5, 0.5))
  }
  
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation()
    if (e.deltaY < 0) {
      setScale(prev => Math.min(prev + 0.25, 5))
    } else {
      setScale(prev => Math.max(prev - 0.25, 0.5))
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <div className="relative w-fit h-fit flex flex-col items-center justify-center select-none group">
      {/* 화면 상단 고정 컨트롤 툴바 (스크린 기준 화면 위쪽에 오도록 fixed 적용) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200">
        <button onClick={handleZoomOut} className="p-1 hover:bg-slate-200 rounded-full text-slate-700 transition-colors" title="축소">
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="w-14 text-center text-sm font-semibold text-slate-700">
          {Math.round(scale * 100)}%
        </div>
        <button onClick={handleZoomIn} className="p-1 hover:bg-slate-200 rounded-full text-slate-700 transition-colors" title="확대">
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="w-[1px] h-5 bg-slate-300 mx-2" />
        <button onClick={handleReset} className="p-1 hover:bg-slate-200 rounded-full text-slate-700 transition-colors" title="비율 초기화">
          <RotateCcw className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {/* 이미지 드래그/줌 컨테이너 (고정 크기 박스로 사진 크기에 맞게 피팅) */}
      <div 
        className={`w-fit h-fit flex items-center justify-center touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={url} 
          alt="Worklog attachment full" 
          draggable={false}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          className="max-w-[90vw] max-h-[85vh] object-contain pointer-events-auto rounded-md drop-shadow-2xl" 
        />
      </div>
    </div>
  )
}

function CommentThread({ comment, replies, onReply }: { comment: Comment, replies: Comment[], onReply: (parentId: string, author: string, content: string) => Promise<void> }) {
  const { userName } = useUser()
  const [isReplying, setIsReplying] = useState(false)
  const [author, setAuthor] = useState(userName || "")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !content.trim()) {
      toast.error("이름과 답글 내용을 입력해주세요.")
      return
    }
    setIsSubmitting(true)
    await onReply(comment.id, author, content)
    setIsSubmitting(false)
    setIsReplying(false)
    setContent("")
  }

  return (
    <div className="space-y-2">
      <div className="text-sm">
        <span className="font-semibold text-slate-700">{comment.author}</span>
        <span className="text-slate-600 ml-2">{comment.content}</span>
        <span className="inline-block text-[10px] text-slate-400 ml-2 translate-y-[-1px]">
          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
        </span>
        <button onClick={() => setIsReplying(!isReplying)} className="ml-2 text-[11px] text-slate-500 hover:text-indigo-600 font-medium">
          답글
        </button>
      </div>
      
      {replies.length > 0 && (
        <div className="pl-3 border-l-2 border-slate-200 mt-1 space-y-2">
          {replies.map(r => (
            <div key={r.id} className="text-sm relative">
              <span className="font-semibold text-slate-700">{r.author}</span>
              <span className="text-slate-600 ml-2">{r.content}</span>
              <span className="inline-block text-[10px] text-slate-400 ml-2 translate-y-[-1px]">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ko })}
              </span>
            </div>
          ))}
        </div>
      )}

      {isReplying && (
        <form onSubmit={handleSubmit} className="flex gap-2 pl-3 mt-2">
          <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="이름" className="w-16 text-xs h-7 px-2" required />
          <Input value={content} onChange={e => setContent(e.target.value)} placeholder="답글 달기..." className="flex-1 text-xs h-7 px-2" required />
          <Button type="submit" size="sm" className="h-7 px-2 text-xs bg-slate-200 text-slate-700 hover:bg-slate-300" disabled={isSubmitting}>
            {isSubmitting ? "..." : "등록"}
          </Button>
        </form>
      )}
    </div>
  )
}

export function ActivityFeedItem({ log, project }: { log: FullWorkLog, project?: Project }) {
  const { userName, isAdmin } = useUser()
  const [commentText, setCommentText] = useState("")
  const [authorName, setAuthorName] = useState(userName || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showComments, setShowComments] = useState(false)

  // Edit states
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(log.content)
  const [editTags, setEditTags] = useState(log.tags?.map(t => t.name).join(", ") || "")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async () => {
    setIsUpdating(true)
    const tagArray = editTags.split(',').map(s => s.trim()).filter(Boolean)
    try {
      await updateWorkLog(log.id, editContent, tagArray)
      toast.success("워크로그가 성공적으로 수정되었습니다.")
      setIsEditing(false)
    } catch {
      toast.error("수정 실패")
    }
    setIsUpdating(false)
  }

  const handleDelete = async () => {
    if (!confirm("이 활동 피드를 완전히 삭제하시겠습니까? 첨부된 사진과 댓글도 모두 삭제되며 복구할 수 없습니다.")) return
    try {
      await deleteWorkLog(log.id)
      toast.success("활동 피드가 삭제되었습니다.")
    } catch {
      toast.error("삭제 실패")
    }
  }

  const handleAddComment = async (parentId?: string, overrideAuthor?: string, overrideContent?: string) => {
    try {
      await addComment(log.id, overrideAuthor || authorName, overrideContent || commentText, parentId)
      toast.success(parentId ? "답글이 등록되었습니다." : "댓글이 등록되었습니다.")
      if (!parentId) {
        setCommentText("")
        setShowComments(true)
      }
    } catch (err) {
      toast.error("등록에 실패했습니다.")
    }
  }

  const handleSubmitTopLevel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !commentText.trim()) {
      toast.error("이름과 댓글 내용을 모두 입력해주세요.")
      return
    }
    setIsSubmitting(true)
    await handleAddComment()
    setIsSubmitting(false)
  }

  const topLevelComments = log.comments?.filter(c => !c.parent_id) || []
  const getReplies = (parentId: string) => log.comments?.filter(c => c.parent_id === parentId) || []

  return (
    <div className="relative pl-6 pb-6 border-l-2 border-slate-100 last:pb-0 last:border-0">
      <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
      <div className="space-y-1">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium leading-none">
            {log.author} <span className="text-muted-foreground font-normal">in {project?.title || 'Unknown Project'}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ko })}
            </span>
            {(isAdmin || userName === log.author) && (
              <div className="flex items-center gap-1">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger className="p-1 text-slate-400 hover:text-indigo-600 rounded opacity-60 hover:opacity-100 transition-opacity" title="내용 및 해시태그 수정">
                    <Pencil className="w-3.5 h-3.5" />
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogTitle>활동 피드 수정</DialogTitle>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">내용</label>
                        <textarea 
                          value={editContent} 
                          onChange={e => setEditContent(e.target.value)} 
                          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">해시태그 (쉼표로 구분)</label>
                        <Input 
                          value={editTags} 
                          onChange={e => setEditTags(e.target.value)} 
                          placeholder="예: CNC, 밀링, 설계"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
                      <Button onClick={handleUpdate} disabled={isUpdating}>{isUpdating ? "저장 중..." : "변경사항 저장"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <button onClick={handleDelete} className="p-1 text-slate-400 hover:text-rose-600 rounded opacity-60 hover:opacity-100 transition-opacity" title="완전 삭제">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2 whitespace-pre-line bg-slate-50 p-3 rounded-md border border-slate-100">
          {log.content}
        </p>
        
        {log.attachments && log.attachments.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2 pt-1">
            {log.attachments.map(att => (
               <Dialog key={att.id}>
                 <DialogTrigger className="h-16 inline-flex w-auto rounded-md border flex-shrink-0 bg-slate-100 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all p-0 focus:outline-none">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={att.image_url} alt="Worklog attachment" className="h-full w-auto object-cover" />
                 </DialogTrigger>
                 <DialogContent className="!w-fit !h-fit !max-w-[95vw] !border-none !bg-transparent !p-0 !shadow-none !ring-0 !outline-none flex justify-center items-center">
                    <DialogTitle className="sr-only">첨부 이미지 시각적 분석 및 줌</DialogTitle>
                    <ImageZoomViewer url={att.image_url} />
                 </DialogContent>
               </Dialog>
            ))}
          </div>
        )}
        
        {log.tags && log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {log.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0">
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-4 pt-2 border-t border-slate-100/60">
           <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-500 mb-1" onClick={() => setShowComments(!showComments)}>
             <MessageCircle className="w-3.5 h-3.5 mr-1" />
             댓글 {log.comments?.length || 0}개
           </Button>
           
           {showComments && (
             <div className="space-y-4 bg-slate-50/50 p-3 rounded-md border border-slate-100 mt-1">
               {topLevelComments.length > 0 ? (
                 <div className="space-y-4 mb-3">
                   {topLevelComments.map(comment => (
                     <CommentThread 
                        key={comment.id} 
                        comment={comment} 
                        replies={getReplies(comment.id)} 
                        onReply={(parentId, author, content) => handleAddComment(parentId, author, content)} 
                     />
                   ))}
                 </div>
               ) : (
                 <p className="text-xs text-muted-foreground mb-3 font-medium">첫 댓글을 남겨보세요.</p>
               )}
               
               <form onSubmit={handleSubmitTopLevel} className="flex gap-2 border-t border-slate-100 pt-3">
                 <Input 
                   value={authorName} onChange={e => setAuthorName(e.target.value)} 
                   placeholder="이름" className="w-20 text-xs h-8" required 
                 />
                 <Input 
                   value={commentText} onChange={e => setCommentText(e.target.value)} 
                   placeholder="새로운 댓글 달기..." className="flex-1 text-xs h-8" required 
                 />
                 <Button type="submit" size="sm" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                   {isSubmitting ? "..." : "등록"}
                 </Button>
               </form>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
