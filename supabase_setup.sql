-- Supabase 로봇설계 PM 데이터베이스 스키마 초기화 스크립트

-- 외래키(Foreign Key)가 얽혀있으므로 자식 테이블부터 삭제합니다.
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS work_log_attachments;
DROP TABLE IF EXISTS work_logs;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS users;

-- 1. 프로젝트 (projects) 테이블
CREATE TABLE projects (
    id text PRIMARY KEY,
    title text NOT NULL,
    status text NOT NULL,
    leader_name text NOT NULL,
    team_members text,
    progress integer NOT NULL DEFAULT 0
);

-- 2. 사용자 (users) 테이블
CREATE TABLE users (
    id text PRIMARY KEY,
    name text NOT NULL,
    project_id text NOT NULL,
    role text NOT NULL DEFAULT 'student',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. 워크로그 (work_logs) 테이블
CREATE TABLE work_logs (
    id text PRIMARY KEY,
    project_id text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 4. 워크로그 첨부파일 (work_log_attachments) 테이블
CREATE TABLE work_log_attachments (
    id text PRIMARY KEY,
    work_log_id text NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
    image_url text NOT NULL
);

-- 5. 태그 (tags) 테이블
CREATE TABLE tags (
    id text PRIMARY KEY,
    work_log_id text NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
    name text NOT NULL
);

-- 6. 댓글 및 대댓글 (comments) 테이블
CREATE TABLE comments (
    id text PRIMARY KEY,
    work_log_id text NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
    parent_id text,
    author text NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 7. 비품 신청 관리 (resources) 테이블
CREATE TABLE resources (
    id text PRIMARY KEY,
    item_name text NOT NULL,
    purchase_url text,
    quantity integer NOT NULL,
    estimated_price numeric NOT NULL,
    status text NOT NULL DEFAULT '신청',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security) 정책 끄기 (자유로운 데이터 입출력을 위함)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_log_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE resources DISABLE ROW LEVEL SECURITY;
