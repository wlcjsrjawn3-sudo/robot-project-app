export type Project = {
  id: string
  title: string
  status: string
  leader_name: string
  team_members?: string
  progress: number
}

export type AppUser = {
  id: string
  name: string
  project_id: string
  role: 'student' | 'admin'
  created_at: string
  pin?: string
}

export type WorkLog = {
  id: string
  project_id: string
  author: string
  content: string
  created_at: string
}

export type WorkLogAttachment = {
  id: string
  work_log_id: string
  image_url: string
}

export type Tag = {
  id: string
  work_log_id: string
  name: string
}

export type Comment = {
  id: string
  work_log_id: string
  parent_id?: string
  author: string
  content: string
  created_at: string
}

export type Resource = {
  id: string
  item_name: string
  purchase_url: string
  quantity: number
  estimated_price: number
  status: '신청' | '승인' | '반려' | '지급'
  created_at?: string
}

// In-memory mock database
type MockDB = {
  projects: Project[]
  work_logs: WorkLog[]
  work_log_attachments: WorkLogAttachment[]
  tags: Tag[]
  comments: Comment[]
  resources: Resource[]
  users: AppUser[]
}

declare global {
  var mockDb: MockDB | undefined
}

const initialDb: MockDB = {
  projects: [
    {
      id: 'p1',
      title: '휴머노이드 로봇 팔 개선',
      status: '설계',
      leader_name: '홍길동',
      progress: 30,
    },
    {
      id: 'p2',
      title: '자율주행 모바일 로봇 플랫폼',
      status: '가공',
      leader_name: '김철수',
      progress: 65,
    }
  ],
  users: [],
  work_logs: [],
  work_log_attachments: [],
  tags: [],
  comments: [],
  resources: [
    {
      id: 'r1',
      item_name: '라즈베리파이 4 8GB',
      purchase_url: 'https://example.com/pi4',
      quantity: 5,
      estimated_price: 125000,
      status: '신청',
      created_at: new Date().toISOString(),
    }
  ]
}

export const mockDb = global.mockDb || initialDb

// 핫 리로드 시 기존 전역 객체에 새 속성(comments, users)이 없을 수 있으므로 안전하게 초기화
if (!mockDb.comments) {
  mockDb.comments = []
}
if (!mockDb.users) {
  mockDb.users = []
}

if (process.env.NODE_ENV !== 'production') {
  global.mockDb = mockDb
}
