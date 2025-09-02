# E‑Learning Platform Implementation Pack

> A practical, job‑focused CS learning platform with Google login, UPI payments, admin analytics, video courses + comments, and live classes (Zoom‑like).

---

## 1) The Tech Bible

### 1.1 Core Stack (pragmatic, low‑cost)
- **Frontend**: Next.js (React, App Router), TypeScript, Tailwind, shadcn/ui (for fast UI).
- **Backend API**: Python **FastAPI** on Uvicorn (ASGI), Starlette WebSockets.
- **Auth**: Google OAuth 2.0 (Authorization Code + PKCE) via **Authlib** on FastAPI. Session via HttpOnly cookies; API auth via JWT (access/refresh) or session token.
- **Database (free‑tier)**: **Neon** Serverless Postgres (primary). Alternative: Supabase (managed Postgres) if you want built‑in auth/storage later.
- **Cache / queues**: **Redis** (Upstash free tier). Background jobs via **Celery** (broker=Redis).
- **Storage (videos, thumbnails, attachments)**: **Cloudflare R2** (S3‑compatible). Start with progressive MP4; upgrade to HLS later.
- **Video‑conferencing**: **LiveKit** (self‑host or Cloud) **or** Jitsi (self‑host). Use WebRTC (SFU). TURN via **coturn** when NAT traversal is needed.
- **Payments (India UPI)**: **Razorpay** (primary) or **PhonePe** (alt). Webhooks for order/payment events.
- **Analytics & Admin**: **PostHog** (product analytics, session replay, feature flags). Custom admin dashboard in Next.js for ops.
- **Observability**: Sentry (errors) + OpenTelemetry (traces/metrics/logs) exporters.
- **CI/CD & Infra**: GitHub Actions; deploy API on Fly.io/Render/Railway; Next.js on Vercel; R2 for storage; LiveKit self‑host (Docker) or LiveKit Cloud.
- **LLM tooling**: **Claude CLI** for content ops (outlines, quizzes, moderation, summaries); optional server‑side task runner.

### 1.2 Monorepo Layout
```
repo/
  apps/
    api/                # FastAPI app
      app/
        main.py
        deps.py         # DI, settings
        models.py       # SQLAlchemy ORM
        schemas.py      # Pydantic v2 models
        api/            # routers
          auth.py
          courses.py
          comments.py
          payments.py
          uploads.py
          live.py
        services/
          auth_service.py
          payment_service.py
          storage_service.py
          rtc_tokens.py
        workers/
          celery_app.py
          tasks.py
        db/
          alembic/
          alembic.ini
      pyproject.toml
      .env.example
    web/                # Next.js + Tailwind + shadcn
      app/
      components/
      lib/
  packages/
    ui/                 # shared UI if needed
    tsconfig/
  .github/workflows/
  docker-compose.yml
```

### 1.3 Environment Variables (sample)
```
# Auth / App
APP_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SECRET_KEY=supersecret
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.yourdomain.com/auth/google/callback
# Database
DATABASE_URL=postgresql+psycopg://user:pass@host/db
# Redis / Celery
REDIS_URL=redis://default:pass@host:6379/0
# Storage (R2 S3-compatible)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=courses
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
# Payments
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
PHONEPE_MERCHANT_ID=...
PHONEPE_SALT_KEY=...
# LiveKit (if using)
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=https://your-livekit-host
# Sentry / OTel
SENTRY_DSN=...
OTEL_EXPORTER_OTLP_ENDPOINT=...
POSTHOG_API_KEY=...
```

### 1.4 Database Schema (MVP)
- **users**(id, email, name, picture_url, role[student|instructor|admin], created_at)
- **oauth_accounts**(id, user_id, provider, provider_user_id)
- **courses**(id, title, slug, summary, price_inr, is_published, owner_id, created_at)
- **modules**(id, course_id, title, order_index)
- **lessons**(id, module_id, title, order_index, video_key, duration_sec, free_preview)
- **comments**(id, user_id, lesson_id, body, parent_id, created_at)
- **enrollments**(id, user_id, course_id, status[pending|active|refunded], created_at)
- **orders**(id, user_id, course_id, provider[razorpay|phonepe], amount_inr, status, provider_order_id)
- **payments**(id, order_id, provider_payment_id, status, meta_json)
- **live_rooms**(id, course_id, title, start_ts, end_ts, sfu_provider[livekit|jitsi], room_name)
- **attendance**(id, room_id, user_id, joined_at, left_at)
- **audit_log**(id, actor_id, action, target, meta, created_at)

> Add indices on (course_id), (module_id, order_index), (lesson_id, created_at), and unique(email), unique(slug).

### 1.5 FastAPI: App Skeleton
```python
# apps/api/app/main.py
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from .api import auth, courses, comments, payments, uploads, live

app = FastAPI(title="Elearning API")
app.add_middleware(SessionMiddleware, secret_key="CHANGE_ME", same_site="lax", https_only=True)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(courses.router, prefix="/courses", tags=["courses"])
app.include_router(comments.router, prefix="/comments", tags=["comments"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
app.include_router(live.router, prefix="/live", tags=["live"])
```

### 1.6 Google OAuth with Authlib (Authorization Code + PKCE)
```python
# apps/api/app/api/auth.py
from fastapi import APIRouter, Request, Depends
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from .deps import settings, db

router = APIRouter()
oauth = OAuth()
CONF = {
    "client_id": settings.GOOGLE_CLIENT_ID,
    "client_secret": settings.GOOGLE_CLIENT_SECRET,
    "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
    "access_token_url": "https://oauth2.googleapis.com/token",
    "client_kwargs": {"scope": "openid email profile"},
}

oauth.register("google", **CONF)

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = settings.APP_BASE_URL + "/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo") or await oauth.google.parse_id_token(request, token)
    # upsert user, set session, issue JWT if you prefer token auth
    request.session["uid"] = userinfo["sub"]
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard")
```

### 1.7 SQLAlchemy 2.0 ORM Models (example)
```python
# apps/api/app/models.py
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, ForeignKey, Boolean, Text

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(20), default="student")

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(200), unique=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
```

### 1.8 File Uploads to Cloudflare R2 with Presigned URLs
```python
# apps/api/app/api/uploads.py
from fastapi import APIRouter, Depends
import boto3
from botocore.client import Config
from .deps import settings

router = APIRouter()

@router.post("/presign")
async def create_presigned_key(key: str):
    s3 = boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": settings.R2_BUCKET, "Key": key, "ContentType": "video/mp4"},
        ExpiresIn=900,
        HttpMethod="PUT",
    )
    return {"upload_url": url, "key": key}
```

### 1.9 Razorpay: Create Order + Webhook Verify (UPI)
```python
# apps/api/app/api/payments.py
from fastapi import APIRouter, Request, HTTPException
import hmac, hashlib, base64, httpx
from .deps import settings

router = APIRouter()

@router.post("/razorpay/orders")
async def create_order(amount_inr: int, receipt: str):
    payload = {"amount": amount_inr * 100, "currency": "INR", "receipt": receipt}
    auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    async with httpx.AsyncClient() as client:
        r = await client.post("https://api.razorpay.com/v1/orders", json=payload, auth=auth)
        r.raise_for_status()
        return r.json()

@router.post("/razorpay/webhook")
async def webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    secret = settings.RAZORPAY_KEY_SECRET.encode()
    digest = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(digest, signature):
        raise HTTPException(400, "Invalid signature")
    event = await request.json()
    # idempotently upsert payment/order status here
    return {"ok": True}
```

### 1.10 WebSockets: Lesson Comments (live updates)
```python
# apps/api/app/api/comments.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set

router = APIRouter()
rooms: Dict[str, Set[WebSocket]] = {}

@router.websocket("/ws/lesson/{lesson_id}")
async def comments_ws(ws: WebSocket, lesson_id: str):
    await ws.accept()
    room = rooms.setdefault(lesson_id, set())
    room.add(ws)
    try:
        while True:
            msg = await ws.receive_text()
            # persist to DB (omitted), then broadcast
            for client in list(room):
                await client.send_text(msg)
    except WebSocketDisconnect:
        room.remove(ws)
```

### 1.11 Live Classes: LiveKit Token (server‑generated)
```python
# apps/api/app/services/rtc_tokens.py
import time, jwt

def livekit_access_token(api_key: str, api_secret: str, identity: str, room: str):
    payload = {
        "iss": api_key,
        "sub": identity,
        "exp": int(time.time()) + 3600,
        "video": {
            "room": room,
            "roomCreate": True,
            "canPublish": True,
            "canSubscribe": True,
        },
    }
    return jwt.encode(payload, api_secret, algorithm="HS256")
```
Client joins with LiveKit JS SDK using this token. For Jitsi self‑host, you’ll create rooms via REST/prosody config and pass meeting URLs to clients.

### 1.12 Background Jobs (Celery)
```python
# apps/api/app/workers/celery_app.py
from celery import Celery
import os

celery = Celery(
    "api", broker=os.environ["REDIS_URL"], backend=os.environ["REDIS_URL"],
)

@celery.task
def transcode_to_hls(key: str) -> str:
    # call ffmpeg, upload segments to R2, return playlist path
    return f"hls/{key}.m3u8"
```

### 1.13 Analytics & Observability
```python
# Sentry
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration
sentry_sdk.init(dsn="${SENTRY_DSN}", integrations=[FastApiIntegration(), StarletteIntegration()])

# OpenTelemetry (basic)
# pip install opentelemetry-sdk opentelemetry-instrumentation-fastapi opentelemetry-exporter-otlp
```
Frontend: add PostHog snippet + identify users after login; track key events (video_play, comment_posted, payment_success, live_join).

### 1.14 Rate Limiting (SlowAPI)
```python
# pip install slowapi
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Depends

limiter = Limiter(key_func=get_remote_address)
@app.get("/health")
@limiter.limit("30/minute")
def health():
    return {"ok": True}
```

### 1.15 Admin Dashboard (Next.js)
- Protected routes (role=admin).
- Panels: Revenue (by course), Enrollments, Engagement (PostHog embeddings), Live room attendance, Upload status (jobs), Errors (Sentry).
- Feature flags for staged rollouts (PostHog).

### 1.16 Local Dev with Docker Compose (excerpt)
```yaml
version: "3.9"
services:
  api:
    build: ./apps/api
    env_file: ./apps/api/.env
    ports: ["8000:8000"]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  livekit:
    image: livekit/livekit-server:latest
    environment:
      LIVEKIT_API_KEY: ${LIVEKIT_API_KEY}
      LIVEKIT_API_SECRET: ${LIVEKIT_API_SECRET}
    ports: ["7880:7880"]
  coturn:
    image: coturn/coturn
    ports: ["3478:3478", "5349:5349"]
```

### 1.17 Security Checklist (MVP)
- OAuth flow uses PKCE + state; verify Google ID token.
- HttpOnly/SameSite cookies; CSRF tokens for POST from browser.
- HMAC verification on Razorpay/PhonePe webhooks.
- RBAC checks on admin endpoints; row‑level checks for course/lesson mutations.
- Signed presigned URLs (short TTL, content‑type restrictions).
- TURN server for WebRTC; enforce E2E on chat if required.
- Backups: Nightly DB backups (Neon has PITR/branching).

---

## 2) System Design Document

### 2.1 Requirements
**Functional**: Google login, course catalog, enrollments, UPI checkout, video upload/stream, per‑lesson comments, live classes with rooms, admin analytics.

**NFRs**:
- Availability 99.9% (single region acceptable at start).
- P95 API latency < 300ms (excluding cold start on serverless DB).
- Live class latency: < 300ms one‑way (SFU + TURN on fallback).
- Scalability: 1K concurrent learners per live room with SFU (scale horizontally).
- Security: OAuth2, webhook signature validation, audit logs.

### 2.2 High‑Level Architecture
- **Web (Next.js)** ↔ **API (FastAPI)** ↔ **DB (Neon Postgres)**
- **Storage (R2)** for videos & assets via presigned upload/download.
- **Payments (Razorpay/PhonePe)** via hosted checkout + webhooks → API updates orders/enrollments.
- **Realtime**: WebSockets for comments; **LiveKit/Jitsi** for live sessions (separate signaling/media paths). TURN for NAT.
- **Async jobs**: Celery for encoding, thumbnails, email, cleanup.
- **Analytics**: PostHog JS + server events; Sentry + OTel exporters.

### 2.3 Key Flows
**Login**: Browser → Google consent → callback → API verifies token → session cookie → frontend state hydrated.

**Enroll & Pay (UPI)**: Create `orders` row → call provider to create order → redirect to provider checkout → provider → webhook → API verifies signature → mark `payments` captured → `enrollments.status=active` → email receipt.

**Upload Course Video**: Admin requests presigned URL → uploads directly to R2 → API queues Celery task for optional transcode → on success set `lessons.video_key`.

**Watch Lesson**: Client requests signed GET URL → progressive stream (or HLS) from R2.

**Live Class**: Instructor schedules a `live_room` → backend generates LiveKit token → client joins via LiveKit SDK; chat over DataChannel or app WebSocket; attendance recorded.

### 2.4 Data Model Notes
- Use soft deletes only where necessary. Keep `audit_log` for admin actions.
- Payments must be idempotent: use `provider_order_id` and unique constraints.

### 2.5 Scalability & Reliability
- API stateless; scale behind a load balancer.
- Redis for pub/sub (broadcast comments, live presence if needed).
- LiveKit horizontally scalable (multi‑node with Redis).
- Database connection pooling (pgbouncer or provider built‑in).
- Retry with exponential backoff for provider calls; idempotency keys.
- Webhooks: at‑least‑once; dedupe by event id.

### 2.6 Security & Compliance
- Secrets managed via cloud secrets; never in repo.
- CORS restricted to FRONTEND_URL.
- Input validation with Pydantic; output filtering; parameterized SQL only via ORM.
- Content moderation pipeline (LLM) on comments/uploads (pre/post‑publish).

### 2.7 Observability
- Metrics: request rate, error rate, latency (RED). Live metrics: packet loss, RTT (from SFU stats API).
- Logs: structured JSON; correlation IDs per request & per live room.
- Traces across API ↔ DB ↔ providers.

### 2.8 Testing Strategy
- Unit tests for services; pytest‑asyncio for async routes.
- Contract tests for webhook handlers with recorded payloads.
- Load tests for WebSockets & LiveKit rooms (k6 + browser automation).

### 2.9 Deployment Plan (Phases)
- **M0 (2–3 weeks)**: Auth, courses CRUD, uploads, simple playback, UPI checkout (Razorpay), comments (no realtime), admin basics.
- **M1**: Realtime comments, PostHog, Sentry, Celery jobs for thumbnails, instructor live classes (LiveKit single node), attendance.
- **M2**: HLS transcode, TURN hardening, robust RBAC, rate limiting, refunds, coupons, feature flags.
- **M3**: Multi‑tenant orgs, certificates, quizzes, recommendation engine, SSO for partners, mobile app shell.

---

## 3) LLM Orchestrator: Master Prompt (Claude CLI‑first)

### 3.1 Philosophy
Use LLMs to accelerate **content operations** (outlines, micro‑lessons, quizzes), **moderation**, **summaries/transcripts**, **support**, and **analytics insights**. Keep LLMs **out of the critical path** for logins/payments.

### 3.2 Global System Prompt (paste into a file `prompts/system.md`)
```
You are the E‑Learning Ops Orchestrator. Objectives: (1) generate high‑quality, industry‑relevant CS curriculum aligned with current tech hiring; (2) enforce safety & academic honesty; (3) produce quizzes/projects with evaluations; (4) summarize and index live class recordings; (5) draft product insights.

Principles: factual, current, cite sources when asked, avoid hallucinations, ask for context when ambiguous, be concise for learners, detailed for instructors. Respect policy: no piracy, no PII leakage in outputs, no harmful content.

Output format: respond using JSON when the tool requests it; otherwise Markdown with headings, code blocks, and checklists.
```

### 3.3 Tool Schemas (for a simple in‑house "tools" wrapper)
```
# content_tools.json
{
  "tools": [
    {
      "name": "make_outline",
      "description": "Create course outline from title + target profile",
      "input_schema": {"title":"string","audience":"string","duration_hours":"number"},
      "output_schema": {"modules":"Module[]"}
    },
    {
      "name": "make_quiz",
      "description": "Generate quiz from text/context",
      "input_schema": {"context":"string","num_questions":"number","level":"string"},
      "output_schema": {"questions":"Question[]"}
    },
    {
      "name": "moderate_comment",
      "description": "Label a comment per policy",
      "input_schema": {"text":"string"},
      "output_schema": {"label":"enum[allow,review,block]","reasons":"string[]"}
    },
    {
      "name": "summarize_transcript",
      "description": "Chunk + summarize transcript; emit key topics and timestamps",
      "input_schema": {"transcript":"string","max_words":"number"},
      "output_schema": {"summary":"string","topics":"string[]","highlights":"{ts:number, note:string}[]"}
    }
  ]
}
```

### 3.4 Reusable Task Prompts (Claude CLI examples)
**Generate Outline**
```
claude --prompt-file prompts/system.md \
  --message 'TOOL:make_outline {"title":"Practical Data Structures & Algorithms for Interviews","audience":"B.Tech CS juniors preparing for SDE jobs","duration_hours":20}'
```

**Quiz from a Lesson**
```
claude --prompt-file prompts/system.md \
  --message 'TOOL:make_quiz {"context": "<paste cleaned transcript>", "num_questions": 10, "level": "medium"}'
```

**Moderate Comment**
```
claude --prompt-file prompts/system.md \
  --message 'TOOL:moderate_comment {"text": "this solution is dumb"}'
```

**Summarize Live Class**
```
claude --prompt-file prompts/system.md \
  --message 'TOOL:summarize_transcript {"transcript":"<text>", "max_words": 250}'
```

### 3.5 LLM‑in‑the‑loop Workflows
- **Content pipeline**: Instructor draft → LLM outline → instructor edits → record → Whisper transcription → LLM summaries & quiz → publish.
- **Moderation**: On comment submit → LLM labels → if `review`/`block`, hold and alert admin.
- **Student success**: Nightly → LLM reviews analytics → generates at‑risk learners list + suggestions for nudges.

### 3.6 Guardrails & Red‑Team Prompts
- Provide adversarial examples to test moderation (slurs, spam, promo links).
- Provide policy docs for plagiarism and code‑of‑conduct; block or warn outputs violating policy.

---

## 4) Acceptance Criteria (MVP)
- Users sign in with Google; profile and session persist across refresh.
- Admin uploads a video via presigned URL and publishes a lesson.
- Students view video, post comments, and see new comments in realtime.
- UPI payment succeeds in sandbox; webhook updates enrollment.
- Instructor schedules and runs a live room; students join and audio/video work through NAT.
- Admin dashboard shows DAU, payments, enrollments, and live attendance.

## 5) Backlog (near‑term)
- HLS transcoding & thumbnails (Celery + ffmpeg).
- Quizzes with grading & certificates.
- Notes & bookmarks per timestamp.
- Mobile PWA wrappers.
- Organization accounts (B2B), GST invoices.

---

**Done is better than perfect.** This pack gives you a testable, payment‑ready, live‑class‑capable MVP you can stand up quickly, while leaving room to scale and harden as traction grows.

