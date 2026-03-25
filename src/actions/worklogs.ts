"use server"

import { isMockMode, supabase } from "@/lib/supabase"
import { mockDb, WorkLog, WorkLogAttachment, Tag, Comment } from "@/lib/mock-db"
import { revalidatePath } from "next/cache"

export type FullWorkLog = WorkLog & {
  attachments: WorkLogAttachment[]
  tags: Tag[]
  comments?: Comment[]
}

export async function getWorkLogs(): Promise<FullWorkLog[]> {
  if (isMockMode) {
    return mockDb.work_logs.map(log => ({
      ...log,
      attachments: mockDb.work_log_attachments.filter(a => a.work_log_id === log.id),
      tags: mockDb.tags.filter(t => t.work_log_id === log.id),
      comments: mockDb.comments.filter(c => c.work_log_id === log.id).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  
  const { data, error } = await supabase.from('work_logs').select(`
    *,
    attachments:work_log_attachments(*),
    tags:tags(*),
    comments:comments(*)
  `).order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  
  // supabase responses might rename the foreign keys if we don't map properly,
  // ensure we just map correctly if needed, but exact names work if schema is perfect.
  return (data || []) as unknown as FullWorkLog[]
}

export async function addWorkLog(data: { project_id: string, author: string, content: string, attachments: string[], tags: string[] }) {
  const newId = `w${Date.now()}`
  const now = new Date().toISOString()
  
  const log: WorkLog = {
    id: newId,
    project_id: data.project_id,
    author: data.author,
    content: data.content,
    created_at: now
  }
  
  const attachments: WorkLogAttachment[] = data.attachments.map((url, i) => ({
    id: `a${Date.now()}_${i}`,
    work_log_id: newId,
    image_url: url
  }))
  
  const tags: Tag[] = data.tags.map((tag, i) => ({
    id: `t${Date.now()}_${i}`,
    work_log_id: newId,
    name: tag
  }))
  
  if (isMockMode) {
    mockDb.work_logs.push(log)
    mockDb.work_log_attachments.push(...attachments)
    mockDb.tags.push(...tags)
  } else {
    const { error: logError } = await supabase.from('work_logs').insert([log])
    if (logError) throw new Error(logError.message)
    if (attachments.length > 0) {
      await supabase.from('work_log_attachments').insert(attachments)
    }
    if (tags.length > 0) {
      await supabase.from('tags').insert(tags)
    }
  }
  
  // Revalidate routes where work logs are shown
  revalidatePath('/')
  revalidatePath('/worklogs')
  return log
}

export async function addComment(workLogId: string, author: string, content: string, parentId?: string) {
  const newComment: Comment = {
    id: `c${Date.now()}`,
    work_log_id: workLogId,
    parent_id: parentId,
    author,
    content,
    created_at: new Date().toISOString()
  }

  if (isMockMode) {
    mockDb.comments.push(newComment)
  } else {
    const { error } = await supabase.from('comments').insert([newComment])
    if (error) throw new Error(error.message)
  }
  revalidatePath('/')
  revalidatePath('/worklogs')
  return newComment
}

export async function updateWorkLog(id: string, content: string, newTags: string[]) {
  if (isMockMode) {
    const log = mockDb.work_logs.find(l => l.id === id)
    if (log) log.content = content
    
    // reset tags
    mockDb.tags = mockDb.tags.filter(t => t.work_log_id !== id)
    const tagObjs: Tag[] = newTags.map((t, i) => ({
      id: `t${Date.now()}_${i}`,
      work_log_id: id,
      name: t
    }))
    mockDb.tags.push(...tagObjs)
  } else {
    const { error: logError } = await supabase.from('work_logs').update({ content }).eq('id', id)
    if (logError) throw new Error(logError.message)
    
    await supabase.from('tags').delete().eq('work_log_id', id)
    const tags = newTags.map(t => ({ work_log_id: id, name: t }))
    if (tags.length > 0) {
      await supabase.from('tags').insert(tags)
    }
  }
  revalidatePath('/')
  revalidatePath('/worklogs')
}

export async function deleteWorkLog(id: string) {
  if (isMockMode) {
    mockDb.work_logs = mockDb.work_logs.filter(l => l.id !== id)
    mockDb.work_log_attachments = mockDb.work_log_attachments.filter(a => a.work_log_id !== id)
    mockDb.tags = mockDb.tags.filter(t => t.work_log_id !== id)
    mockDb.comments = mockDb.comments.filter(c => c.work_log_id !== id)
  } else {
    const { error } = await supabase.from('work_logs').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/')
  revalidatePath('/worklogs')
}
