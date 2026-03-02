# StudyKit

An interactive learning platform for universities where teachers create courses and students learn through practice.

## Why This Exists

I built StudyKit to solve a problem I faced in university: lectures alone weren't enough to understand the material. Each professor teaches differently, and sometimes you need a different perspective to really get it.

StudyKit lets professors duplicate their courses online — so students who missed something in class can review it at home, at their own pace. And practice problems help them prepare for exams.

## What It Is

An online platform designed specifically for universities, where each teacher can build their own course — because everyone presents information differently. Students get a place to review material and practice with real exercises.

## Features

- Multi-format lectures: Markdown, Video, SQL problems
- SQL execution engine with automatic validation
- Progress tracking per student
- Sample SQL course included (based on real university material)

## Tech Stack

- **Frontend**: React 19 + Vite + React Router
- **API**: Hono (Node.js)
- **Worker**: BullMQ + Redis
- **Executor**: SQL sandbox for problem validation
- **CMS**: Directus
- **Database**: PostgreSQL

## Quick Start

```bash
cp .env.example .env
docker compose up -d
```

Open http://localhost:5173

## Project Structure

```
apps/
├── frontend      # Student UI (React + Vite)
├── api           # REST API (Hono)
├── worker        # Background job processor (BullMQ)
└── executor      # SQL code validator

packages/
└── db            # Shared Drizzle schema
```

## Architecture Overview

```
┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│     API      │
│   (React)   │     │    (Hono)    │
└─────────────┘     └──────┬──────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌──────────┐      ┌────────────┐     ┌──────────┐
   │  Worker  │      │  Executor  │     │ Directus │
   │ (BullMQ) │      │ (SQL eval) │     │   (CMS)  │
   └──────────┘      └────────────┘     └──────────┘
```

- **Frontend** serves the student interface
- **API** handles authentication, courses, lectures, and solution submissions
- **Worker** processes SQL solution checks asynchronously via BullMQ
- **Executor** safely executes student SQL code and validates results
- **Directus** provides CMS capabilities for content management

## Sample Course

The project includes a sample SQL course demonstrating:
- Lecture content with Markdown
- Interactive SQL problems
- Automatic code validation

Students can write SQL queries, submit them, and receive immediate feedback on whether their solution is correct.
