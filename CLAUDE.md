# CLAUDE.md

## 1. Overview

**prelegal** is an AI-powered legal document generator. Users fill out a form with party details and agreement terms; the app generates a formatted, downloadable Mutual NDA PDF with a live preview.

- Templates are sourced from [Common Paper](https://github.com/commonpaper) (CC BY 4.0), vendored in `prelegal/`, and cataloged in `catalog.json`.
- The app has a Next.js frontend and a Python FastAPI backend, both containerized via Docker.
- The backend owns auth (sign up / sign in) and LLM calls. The frontend owns the document form, live preview, and PDF export.
- Currently supports Mutual NDA. The catalog contains 11 agreement types for future expansion.

## 2. Development Process

**General rules:**
- Be simple. Work in small, incremental steps. AskUserQuestion for each step before moving on.
- Do not overengineer. Do not program defensively. No exception handlers unless genuinely needed.
- Name things clearly. Favor short modules, short methods, and short functions.
- No emojis in code or print statements. Keep README.md concise.
- Use the **latest APIs** available as of today.

**Feature workflow (follow all 7 steps — do not skip any):**
1. Read feature instructions from Jira using the Atlassian MCP tool.
2. Follow the `feature:dev` skill — all 7 steps, strictly.
3. Write thorough unit tests and integration tests.
4. Fix all bugs before proceeding.
5. Submit a pull request using the GitHub MCP tool.

**Python (backend/scripts):**
- Always `uv run xxx` — never `python3 xxx`
- Always `uv add xxx` — never `pip install xxx`

**Frontend:**
- Read `node_modules/next/dist/docs/` before writing any Next.js code — this version has breaking changes from training data.
- Run the dev server and test in a browser before marking UI work complete.

## 3. AI Design

**LLM provider:** Use the Cerebras skill via the OpenRouter API with `openrouter/cerebras/gpt-oss-120b` as the inference provider.

**Invocation pattern:**
- Call the LLM from the `/api/generate` Next.js API route (never from the client).
- Use **structured output** so the response can be parsed deterministically and used to populate fields in the legal document.
- The LLM generates only the NDA cover page fields from `NdaFormData` inputs.
- Standard terms (11 sections from Common Paper) are appended client-side by `buildMarkdown.ts` after the cover page is returned — do not ask the LLM to rewrite them.

**Key constraint:** Never expose the OpenRouter API key to the client. All LLM calls must go through the Next.js API route. the API is stored in .env in the project root.

## 4. Technical Design

**Stack:**
- Deployment: Docker Compose — one container for the Next.js frontend, one for the Python FastAPI backend
- Frontend: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4
- Backend: Python, FastAPI, SQLite (via the `sqlite3` stdlib — no ORM)
- Document pipeline: `marked` (markdown → HTML) → `DOMPurify` (sanitize) → `html2canvas` + `jsPDF` (PDF export)
- LLM: OpenRouter API (Cerebras / `gpt-oss-120b`) with structured output

**Database — SQLite:**
- The database file (`prelegal.db`) is created from scratch when the backend container starts.
- Initialization runs on startup via a `lifespan` handler in FastAPI — no migration tooling needed.
- Schema:

```sql
CREATE TABLE IF NOT EXISTS users (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    email     TEXT    NOT NULL UNIQUE,
    password  TEXT    NOT NULL,   -- bcrypt hash
    created_at TEXT   NOT NULL DEFAULT (datetime('now'))
);
```

- Auth endpoints: `POST /auth/signup`, `POST /auth/signin` — return a JWT on success.
- Passwords are hashed with `bcrypt`. Plain-text passwords are never stored or logged.

**Key files:**

| File | Responsibility |
|---|---|
| `frontend/src/app/page.tsx` | Two-panel UI: form (left) + live preview (right) |
| `frontend/src/lib/buildMarkdown.ts` | Generates NDA markdown from `NdaFormData`; appends standard terms |
| `frontend/src/app/api/generate/route.ts` | Proxies LLM requests to the FastAPI backend |
| `backend/main.py` | FastAPI app entry point; registers routers and DB lifespan |
| `backend/db.py` | SQLite connection helper and schema initialization |
| `backend/routers/auth.py` | `/auth/signup` and `/auth/signin` endpoints |
| `backend/routers/generate.py` | `/generate` endpoint — calls Cerebras via OpenRouter |
| `catalog.json` | Index of all 11 agreement types and their template file paths |
| `template/` | Raw legal markdown templates organized by agreement type |
| `prelegal/` | Vendored Common Paper template source (CC BY 4.0) |

**Architecture rules:**
- The SQLite file lives inside the backend container. It is ephemeral by default; mount a volume in Docker Compose to persist it across restarts. The `data/` directory at the repo root serves as the local host-side mount point and is gitignored.
- Document generation is markdown-first: generate markdown, render to HTML for preview, export to PDF.
- Client-side: form state, live preview re-render via `useMemo`, PDF export.
- All LLM calls and auth logic live in the FastAPI backend. The Next.js API route is a thin proxy only.
- PDF page breaking uses canvas slicing — do not replace with a CSS-only approach without testing multi-page output.

## 5. Testing & Debugging

- Always identify the root cause before fixing. Prove the problem first — do not guess.
- Reproduce the issue consistently before attempting a fix.
- Try one change at a time. Be methodical.
- Do not apply workarounds. Fix the root cause.

**Running tests:**
```bash
cd frontend && npm test
```

**Dev server:**
```bash
cd frontend && npm run dev
```

For UI changes: open `http://localhost:3000`, test the full form → preview → PDF download flow before reporting done.
