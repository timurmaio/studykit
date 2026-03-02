-- StudyKit Database Schema
-- Migrated from Rails to plain SQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    avatar VARCHAR(255),
    password_digest VARCHAR(255),
    role INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    avatar VARCHAR(255),
    title VARCHAR(255),
    description VARCHAR(255),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    serial_number INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lectures_course_id ON lectures(course_id);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_course_id ON groups(course_id);

-- User groups table (enrollment)
CREATE TABLE IF NOT EXISTS user_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_groups_user_id ON user_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_group_id ON user_groups(group_id);

-- Lecture contents table (polymorphic)
CREATE TABLE IF NOT EXISTS lecture_contents (
    id SERIAL PRIMARY KEY,
    actable_type VARCHAR(255),
    lecture_id INTEGER REFERENCES lectures(id) ON DELETE CASCADE ON UPDATE CASCADE,
    serial_number INTEGER,
    actable_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lecture_contents_lecture_id ON lecture_contents(lecture_id);

-- Markdown contents table
CREATE TABLE IF NOT EXISTS markdown_contents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    body TEXT
);

-- Video contents table
CREATE TABLE IF NOT EXISTS video_contents (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255)
);

-- SQL Problems table
CREATE TABLE IF NOT EXISTS sql_problems (
    id SERIAL PRIMARY KEY,
    initial_code TEXT,
    solution_code TEXT,
    check_function TEXT,
    executable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SQL Problem contents table
CREATE TABLE IF NOT EXISTS sql_problem_contents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    body VARCHAR(255),
    sql_problem_id INTEGER REFERENCES sql_problems(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- SQL Solutions table
CREATE TABLE IF NOT EXISTS sql_solutions (
    id SERIAL PRIMARY KEY,
    sql_problem_id INTEGER REFERENCES sql_problems(id) ON DELETE CASCADE ON UPDATE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    code TEXT,
    succeed BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sql_solutions_user_id ON sql_solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_sql_solutions_problem_id ON sql_solutions(sql_problem_id);

-- Articles table (legacy - may not be used)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    body VARCHAR(255),
    avatar VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Categories table (legacy)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Course categories (legacy)
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Wikidata items table
CREATE TABLE IF NOT EXISTS wikidata_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    wikidata_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Wikidata items to lecture contents (many-to-many)
CREATE TABLE IF NOT EXISTS wikidata_items_to_lecture_contents (
    id SERIAL PRIMARY KEY,
    wikidata_item_id INTEGER REFERENCES wikidata_items(id) ON DELETE CASCADE ON UPDATE CASCADE,
    lecture_content_id INTEGER REFERENCES lecture_contents(id) ON DELETE CASCADE ON UPDATE CASCADE,
    priority INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_wikidata_to_content_item ON wikidata_items_to_lecture_contents(wikidata_item_id);
CREATE INDEX IF NOT EXISTS idx_wikidata_to_content_content ON wikidata_items_to_lecture_contents(lecture_content_id);

-- Refresh tokens table (for API v2)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    token_hash VARCHAR(128) NOT NULL,
    user_agent TEXT,
    ip VARCHAR(100),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    version BIGINT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- User lecture content progress (tracks viewed content)
CREATE TABLE IF NOT EXISTS user_lecture_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    lecture_content_id INTEGER NOT NULL REFERENCES lecture_contents(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_lecture_progress_unique ON user_lecture_progress(user_id, lecture_content_id);
CREATE INDEX IF NOT EXISTS idx_user_lecture_progress_user ON user_lecture_progress(user_id);
