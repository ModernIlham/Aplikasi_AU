# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Sistem Penjadwalan Bus Massal** — bus scheduling system for Indonesian government BTS (Buy The Service) operators. Complies with Permenhub 27/2015 (SPM), Permenhub 79/2013 (driver hours), and TCQSM 3rd Ed. The application is a single-corridor scheduling tool (default Koridor 1E IKN) with 32 functional pages.

## Repository layout (active)

| Path | Purpose |
| --- | --- |
| `JADWAL BUS - Redesign.html` | **Single-file frontend** (~5800 lines, all UI + CSS + JS inline). The actual app. |
| `index.html` | Tiny meta-refresh redirect to the file above. Used so GitHub Pages root URL works. |
| `backend/` | FastAPI + PostgreSQL REST API. Detailed README inside. |
| `.github/workflows/pages.yml` | Auto-deploy frontend to GitHub Pages on push to `main` or this branch. |
| `transitoptima-fixed.jsx` | **Legacy/unused** React prototype (no build chain in repo). Ignore unless explicitly asked. |

## Common commands

### Backend (single-process; also serves frontend at `/`)

```bash
cd backend
docker compose up -d                        # start PostgreSQL
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python seed.py                              # idempotent; safe to re-run
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000 (frontend) + http://localhost:8000/docs (Swagger)
```

There is **no test suite** in this repo; do not invent one. There is **no linter config**; match surrounding style.

### Frontend-only (no backend)

Open `JADWAL BUS - Redesign.html` directly in a browser. The frontend detects this via `window.location.protocol` and stays in static-demo mode (no login, hardcoded data).

### HTML structural validation (used after large edits)

The HTML uses XHTML-style self-closing void elements (`<input/>`, `<meta/>`) which trip stdlib parsers. Use this filter that ignores void-element noise:

```bash
python3 - <<'PY'
from html.parser import HTMLParser
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}
html = open("JADWAL BUS - Redesign.html").read()
class P(HTMLParser):
    def __init__(s): super().__init__(); s.stack=[]; s.errs=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.stack.append((t, s.getpos()))
    def handle_endtag(s,t):
        if t in VOID: return
        if not s.stack: s.errs.append(f"unexpected </{t}>"); return
        top,_=s.stack[-1]
        if top!=t:
            s.errs.append(f"<{top}> closed </{t}>")
            for i in range(len(s.stack)-1,-1,-1):
                if s.stack[i][0]==t: del s.stack[i:]; return
        else: s.stack.pop()
p=P(); p.feed(html); print("errs:", len(p.errs), "unclosed:", [x[0] for x in p.stack])
PY
```

Expected output: `errs: 0 unclosed: []`.

### Git workflow

Active development branch: **`claude/add-pages-fix-frontend-M1JgQ`**. Push commits there; PR #1 auto-updates. Do not push to `main` without explicit instruction.

## Frontend architecture (non-obvious)

Everything lives in `JADWAL BUS - Redesign.html`. There is no build step — just one big HTML file.

### Page system

- 32 pages, each is `<div class="page" id="page-XXX">…</div>` inside `<main class="main">`.
- Pages are hidden by `.page { display: none }` and shown when they have `.active`.
- Navigation: every clickable element with `data-page="XXX"` (sidebar nav-item, topbar buttons, breadcrumb parents, FAQ inline links, command palette items) calls `activatePage(target)` which swaps `.active`. The handler is bound once at startup in the script block.
- **Adding a page**: (1) sidebar nav-item with `data-page="myname"`, (2) `<div class="page" id="page-myname">…</div>` before `</main>`, (3) page is automatically reachable via Ctrl+K palette since it indexes `.nav-item[data-page]` at load.

### Sub-tabs (Jadwal page especially)

The Jadwal page has 7 sub-tabs (`gantt | matrix | rit | perbus | workbench | block | validator`). Each sub-tab is `<div class="tab-pane" data-pane="X">` inside `#page-jadwal`, switched by buttons in `#jadwalTabs`. The `setupTabs` block does the same pattern for the Setup page.

### Global UX layer

Inside the closing `<script>` block (search for `Page navigation`):
- **Command palette** (`#cmdk`): Ctrl+K / Cmd+K. Indexes nav items + a hardcoded `actions` array.
- **Toasts** (`#toastStack`): `toast(title, body, kind)` where kind ∈ `ok|warn|bad`. Auto-attached to all `.btn.primary` without their own handler.
- **Keyboard shortcuts**: Ctrl+K palette, Ctrl+S autosave-toast, F1 → bantuan, Alt+1..7 → main pages, Alt+N → notifikasi.
- **Workbench reactivity** (`initWorkbench` IIFE): real-time recompute of headway/cycle/cost/SPM from sliders. The single source of truth for the formulae.

### Login & API client

- `window.API` (set near the bottom): wraps `fetch`, attaches `Authorization: Bearer <localStorage.jadwal_token>`, redirects to `#loginOverlay` on 401.
- `API.enabled` is true only when served over `http(s)://` — so opening the file directly stays in demo mode.
- `hydrateAll()` populates 7 specific table bodies (Armada, Roster, Halte, Insiden, Notifikasi, Riwayat, Pengguna) plus three sidebar badges. Adding a new hydrator means: `async function hydrateX()` + call it in `hydrateAll()` + bind to the `[data-page]` click for re-fetch.

## Backend architecture

- **Framework**: FastAPI 0.115, SQLAlchemy 2.0 (sync ORM, no async), Pydantic v2, PostgreSQL via `psycopg`.
- **Auth**: bcrypt (passlib) + JWT (python-jose). Token TTL via `JWT_EXPIRES_MIN`. Bearer in `Authorization` header.
- **Tables auto-created** on FastAPI startup (`Base.metadata.create_all` in `lifespan`). No Alembic yet — for production migrations, add Alembic before changing schemas.
- **One `app/models.py` and one `app/schemas.py`** holding all 8 entities (User, Halte, Armada, Sopir, Trip, Insiden, Notifikasi, AuditLog). When adding an entity, keep this convention — don't split per file.
- **Routers** in `app/routers/<entity>.py`, each registered in `app/main.py`. The pattern is repetitive on purpose: list / create / get / patch / delete + occasional summary endpoint.
- **Audit convention** (must follow): every write endpoint calls `write_audit(db, user=..., aksi=..., objek=..., request=request)` from `app/deps.py`. This populates the `audit_logs` table that the Riwayat Aktivitas page reads. Skipping this breaks the audit-trail contract.
- **Same process serves frontend**: `app/main.py` mounts `/` → `index.html` and explicitly handles the spaced filename `/JADWAL BUS - Redesign.html`. No CORS friction in dev.
- **Seed script** (`seed.py`) is idempotent — only inserts when each table is empty. Default users include `admin@dephub.go.id` / `admin1234` and `rizki@dephub.go.id` / `password123`.

## Conventions worth knowing

- **Indonesian-language UI and identifiers** in the frontend (`page-armada`, `page-roster`, etc.). Backend uses Indonesian DB column names too (`waktu_berangkat`, `is_sisipan`, `kategori`). Match this — do not introduce English-named pages or columns.
- **Currency/number formatting**: Indonesian locale — comma decimal (`15,0 m`), `Rp X,YZ Jt`, dates like `03 Mei 2026`. The frontend has `fmtDateTime` / `fmtTime` helpers; reuse them.
- **Status stamps**: `.stamp` (default), `.stamp.warn`, `.stamp.info`, and inline-styled red for `kritis`/`bad`. Don't invent new color systems — use the design tokens defined at top of `<style>` (`--ok-700`, `--warn-600`, `--bad-700`, etc.).
- **Page sections in sidebar** (Beranda · Perencanaan · Analisa & Audit · Rekayasa & Skenario · Operasional Harian · Analitik · Pelaporan · Akun & Sistem · Acuan). New pages should fit one of these — don't create a new section without reason.

## Deployment notes

- **GitHub Pages** (`pages.yml`) hosts only the static frontend. The backend cannot run there. Frontend in Pages mode falls back to demo data automatically.
- For full-stack, host the backend on Render/Railway/VPS and update `index.html` (or add an `API_BASE_URL` constant) to point at the backend domain.
- `JWT_SECRET` in `.env.example` is a dev placeholder — must be replaced for any non-localhost use.
