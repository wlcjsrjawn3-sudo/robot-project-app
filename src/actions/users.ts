"use server"

import { isMockMode, supabase } from "@/lib/supabase"
import { mockDb } from "@/lib/mock-db"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export async function getUsers() {
  if (isMockMode) return mockDb.users
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getUser(id: string) {
  if (isMockMode) return mockDb.users.find(u => u.id === id) || null
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle()
  return data
}

export async function authenticateStudent(name: string, pin: string, projectId: string) {
  if (isMockMode) {
    const existing = mockDb.users.find(u => u.name === name)
    if (existing) {
      if ((existing as any).pin && (existing as any).pin !== pin) throw new Error("PIN_MISMATCH")
      existing.project_id = projectId
      return existing.id
    }
    const newId = `u${Date.now()}`
    mockDb.users.push({ id: newId, name, project_id: projectId, role: 'student', created_at: new Date().toISOString(), pin } as any)
    return newId
  }

  const { data: rows, error } = await supabase.from('users').select('*').eq('name', name).order('created_at', { ascending: false }).limit(1)
  if (error) throw new Error(error.message)
  const data = rows && rows.length > 0 ? rows[0] : null

  if (data) {
    if (data.pin && data.pin !== pin) {
      throw new Error("PIN_MISMATCH")
    }
    await supabase.from('users').update({ project_id: projectId, pin }).eq('id', data.id)
    return data.id
  } else {
    const newId = `u${Date.now()}`
    const { error: insErr } = await supabase.from('users').insert([{
      id: newId,
      name,
      project_id: projectId,
      pin,
      role: 'student'
    }])
    if (insErr) throw new Error(insErr.message)
    return newId
  }
}

export async function upsertUser(data: { id?: string, name: string, project_id: string, role?: 'student' | 'admin', pin?: string }) {
  if (data.role === 'admin' && (!data.id || data.id === "")) {
    if (isMockMode) {
      const existingAdmin = mockDb.users.find(u => u.role === 'admin')
      if (existingAdmin) return existingAdmin.id
    } else {
      const { data: adminRows } = await supabase.from('users').select('id').eq('role', 'admin').limit(1)
      if (adminRows && adminRows.length > 0) return adminRows[0].id
    }
  }

  const userId = data.id && data.id !== "" ? data.id : randomUUID()
  
  if (isMockMode) {
    const existing = mockDb.users.find(u => u.id === userId)
    if (existing) {
      existing.name = data.name
      existing.project_id = data.project_id
      if (data.role) existing.role = data.role
      if (data.pin !== undefined) existing.pin = data.pin
    } else {
      mockDb.users.push({ id: userId, name: data.name, project_id: data.project_id, role: data.role || 'student', created_at: new Date().toISOString(), pin: data.pin })
    }
    return userId
  }

  const { data: existing } = await supabase.from('users').select('id').eq('id', userId).maybeSingle()
  if (existing) {
    const updatePayload: any = { name: data.name, project_id: data.project_id, role: data.role || 'student' }
    if (data.pin !== undefined) updatePayload.pin = data.pin
    await supabase.from('users').update(updatePayload).eq('id', userId)
  } else {
    const insertPayload: any = { id: userId, name: data.name, project_id: data.project_id, role: data.role || 'student' }
    if (data.pin !== undefined) insertPayload.pin = data.pin
    await supabase.from('users').insert([insertPayload])
  }
  revalidatePath("/users")
  return userId
}

export async function deleteUser(id: string) {
  if (isMockMode) {
    mockDb.users = mockDb.users.filter(u => u.id !== id)
  } else {
    await supabase.from('users').delete().eq('id', id)
  }
  revalidatePath("/users")
}
