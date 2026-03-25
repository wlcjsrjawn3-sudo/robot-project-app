"use server"

import { isMockMode, supabase } from "@/lib/supabase"
import { mockDb, Resource } from "@/lib/mock-db"
import { revalidatePath } from "next/cache"

export async function getResources(): Promise<Resource[]> {
  if (isMockMode) {
    return [...mockDb.resources].sort((a,b) => (b.created_at && a.created_at) ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : 0)
  }
  const { data, error } = await supabase.from('resources').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function addResource(resource: Omit<Resource, 'id' | 'status' | 'created_at'>) {
  const newResource: Resource = {
    id: `r${Date.now()}`,
    ...resource,
    status: '신청',
    created_at: new Date().toISOString()
  }
  
  if (isMockMode) {
    mockDb.resources.push(newResource)
  } else {
    const { error } = await supabase.from('resources').insert([newResource])
    if (error) throw new Error(error.message)
  }
  revalidatePath('/resources')
  return newResource
}

export async function updateResourceStatus(id: string, status: Resource['status']) {
  if (isMockMode) {
    const res = mockDb.resources.find(r => r.id === id)
    if (res) res.status = status
  } else {
    const { error } = await supabase.from('resources').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/resources')
}

export async function deleteResource(id: string) {
  if (isMockMode) {
    const index = mockDb.resources.findIndex(r => r.id === id)
    if (index !== -1) mockDb.resources.splice(index, 1)
  } else {
    const { error } = await supabase.from('resources').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/resources')
}
