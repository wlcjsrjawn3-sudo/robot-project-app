"use server"

import { isMockMode, supabase } from "@/lib/supabase"
import { mockDb, Project } from "@/lib/mock-db"

export async function getProjects(): Promise<Project[]> {
  if (isMockMode) {
    return [...mockDb.projects]
  }
  const { data, error } = await supabase.from('projects').select('*').order('title')
  if (error) throw new Error(error.message)
  return data
}

import { revalidatePath } from "next/cache"

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id'>>) {
  if (isMockMode) {
    const project = mockDb.projects.find(p => p.id === id)
    if (project) {
      if (updates.title !== undefined) project.title = updates.title
      if (updates.leader_name !== undefined) project.leader_name = updates.leader_name
      if (updates.team_members !== undefined) project.team_members = updates.team_members
      if (updates.status !== undefined) project.status = updates.status
      if (updates.progress !== undefined) project.progress = updates.progress
    }
  } else {
    const { error } = await supabase.from('projects').update(updates).eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/')
}

export async function addProject(projectData: Omit<Project, 'id'>) {
  const newProject: Project = {
    id: `p${Date.now()}`,
    ...projectData
  }
  if (isMockMode) {
    mockDb.projects.push(newProject)
  } else {
    const { error } = await supabase.from('projects').insert([newProject])
    if (error) throw new Error(error.message)
  }
  revalidatePath('/')
  return newProject
}

export async function deleteProject(id: string) {
  if (isMockMode) {
    const index = mockDb.projects.findIndex(p => p.id === id)
    if (index > -1) mockDb.projects.splice(index, 1)
  } else {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }
  revalidatePath('/')
}
