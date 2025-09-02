# ByteBoost API

FastAPI backend for the ByteBoost E-Learning Platform.

## Features

- 🔐 Google OAuth 2.0 Authentication
- 📚 Course Management System
- 💳 UPI Payments via Razorpay
- 🎥 Video Streaming with Cloudflare R2
- 💬 Real-time Comments via WebSockets
- 📹 Live Classes with LiveKit/Jitsi
- 📊 Analytics with PostHog
- 🚀 Async/Await with SQLAlchemy 2.0
- 📝 Automatic API Documentation

## Tech Stack

- **Framework**: FastAPI 0.115+
- **Database**: PostgreSQL with SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Cache/Queue**: Redis with Celery
- **Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Razorpay
- **WebRTC**: LiveKit
- **Monitoring**: Sentry, OpenTelemetry

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Node.js 18+ (for frontend)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/byteboost.git
cd byteboost/apps/api
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -e ".[dev]"
```

### 4. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Run database migrations

```bash
alembic upgrade head
```

### 6. Start the development server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker Development

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual services

```bash
# Build API image
docker build -t byteboost-api .

# Run API container
docker run -p 8000:8000 --env-file .env byteboost-api
```

## API Documentation

Once the server is running, you can access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## Testing

### Run tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_auth.py

# With verbose output
pytest -v
```

### Linting and formatting

```bash
# Run linter
ruff check .

# Format code
black .

# Type checking
mypy app
```

## Project Structure

```
apps/api/
├── app/
│   ├── api/           # API endpoints
│   ├── core/          # Core configuration
│   ├── db/            # Database setup
│   ├── models.py      # SQLAlchemy models
│   ├── schemas.py     # Pydantic schemas
│   ├── services/      # Business logic
│   └── workers/       # Celery tasks
├── tests/             # Test files
├── alembic/           # Database migrations
├── Dockerfile         # Container configuration
├── pyproject.toml     # Dependencies
└── README.md          # This file
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Application secret key
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `RAZORPAY_KEY_ID`: Razorpay API key
- `R2_ACCESS_KEY_ID`: Cloudflare R2 access key
- `LIVEKIT_API_KEY`: LiveKit API key

## Common Commands

### Database

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

### Celery

```bash
# Start worker
celery -A app.workers.celery_app worker --loglevel=info

# Start beat scheduler
celery -A app.workers.celery_app beat --loglevel=info

# Monitor tasks
celery -A app.workers.celery_app flower
```

## API Endpoints

### Authentication
- `GET /auth/google/login` - Initiate Google OAuth
- `GET /auth/google/callback` - Handle OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Courses
- `GET /courses` - List courses
- `POST /courses` - Create course
- `GET /courses/{id}` - Get course details
- `PUT /courses/{id}` - Update course
- `DELETE /courses/{id}` - Delete course

### Payments
- `POST /payments/razorpay/orders` - Create payment order
- `POST /payments/razorpay/webhook` - Handle payment webhook
- `POST /payments/razorpay/verify` - Verify payment

### Live Classes
- `POST /live/rooms` - Create live room
- `GET /live/rooms/{id}` - Get room details
- `POST /live/rooms/{id}/join` - Join live room

### Uploads
- `POST /uploads/presign` - Get presigned upload URL
- `POST /uploads/complete` - Mark upload complete

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify database exists: `createdb byteboost`

### Redis connection issues
- Ensure Redis is running
- Check REDIS_URL in .env
- Test connection: `redis-cli ping`

### Import errors
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -e ".[dev]"`

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run tests and linting
5. Submit a pull request

## License

Proprietary - ByteBoost © 2025