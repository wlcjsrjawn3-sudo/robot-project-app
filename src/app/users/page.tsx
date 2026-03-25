import { getUsers } from "@/actions/users"
import { getProjects } from "@/actions/projects"
import { UserManagementClient } from "@/components/users/UserManagementClient"

// Next.js dynamic render for admin data freshness
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const users = await getUsers()
  const projects = await getProjects()

  return <UserManagementClient initialUsers={users} projects={projects} />
}
