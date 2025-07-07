# AI Hiring Platform

A comprehensive, AI-powered hiring platform built with FastAPI, React, and Google Cloud Platform. Features advanced security, real-time monitoring, and intelligent candidate screening.

## 🚀 Features

### Core Features
- **AI-Powered Resume Scanning** - Intelligent candidate matching and skill analysis
- **Multimodal Screening** - Video and audio interview analysis
- **Coding Test Platform** - Anti-cheat protected coding assessments
- **JD Generator** - AI-generated job descriptions
- **Hiring Request Management** - Complete hiring workflow automation
- **Real-time Dashboard** - Live insights and analytics

### Security Features
- **Advanced Security Middleware** - Rate limiting, CSRF protection, XSS prevention
- **Anti-Cheat System** - Real-time monitoring for coding tests
- **Input Validation** - Comprehensive sanitization and validation
- **Encryption** - Google Cloud KMS integration
- **Audit Logging** - Complete activity tracking

### Infrastructure
- **Google Cloud Platform** - Production-ready cloud infrastructure
- **CI/CD Pipeline** - Automated testing and deployment
- **Observability** - Comprehensive monitoring and alerting
- **Scalability** - Auto-scaling with Cloud Run

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  FastAPI Backend│    │  Google Cloud   │
│                 │    │                 │    │  Platform       │
│ • 3D UI         │◄──►│ • REST API      │◄──►│ • Cloud SQL     │
│ • Real-time     │    │ • WebSocket     │    │ • Cloud Storage │
│ • PWA           │    │ • Security      │    │ • Vertex AI     │
│ • Responsive    │    │ • Anti-cheat    │    │ • Cloud KMS     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Google Cloud** - AI services and infrastructure

### Frontend
- **React 18** - Modern UI framework
- **Material-UI** - Component library
- **Three.js** - 3D graphics
- **WebSocket** - Real-time communication
- **PWA** - Progressive Web App

### DevOps
- **Docker** - Containerization
- **Google Cloud Run** - Serverless deployment
- **GitHub Actions** - CI/CD pipeline
- **Terraform** - Infrastructure as Code
- **Prometheus** - Metrics collection

## 📋 Prerequisites

- Python 3.11+
- Node.js 18+
- Docker
- Google Cloud CLI
- PostgreSQL (for local development)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/ai-hiring-platform.git
cd ai-hiring-platform
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Initialize database
python -c "from app.database import init_db; init_db()"

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Application Settings
ENVIRONMENT=development
PROJECT_NAME=AI Hiring Platform API
VERSION=0.1.0
API_V1_STR=/api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hiring_platform

# Security
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name

# AI Services
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🏛️ Project Structure

```
ai-hiring-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/          # API endpoints
│   │   ├── core/
│   │   │   ├── config.py        # Configuration
│   │   │   └── security_config.py # Security settings
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Custom middleware
│   │   ├── monitoring/          # Observability
│   │   └── utils/               # Utilities
│   ├── tests/                   # Test suite
│   ├── scripts/                 # Setup scripts
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── features/            # Feature modules
│   │   ├── contexts/            # React contexts
│   │   ├── hooks/               # Custom hooks
│   │   ├── layouts/             # Layout components
│   │   └── utils/               # Utilities
│   ├── public/
│   └── package.json
├── infrastructure/
│   ├── terraform/               # Infrastructure as Code
│   └── docker/                  # Docker configurations
├── docs/                        # Documentation
└── .github/
    └── workflows/               # CI/CD pipelines
```

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  }
}
```

### Hiring Requests Endpoints

#### GET /api/hiring-requests
Get all hiring requests (paginated).

**Query Parameters:**
- `page`: Page number (default: 1)
- `size`: Page size (default: 10)
- `status`: Filter by status
- `department`: Filter by department

#### POST /api/hiring-requests
Create a new hiring request.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We are looking for a senior software engineer...",
  "department": "Engineering",
  "position": "Senior Software Engineer",
  "priority": "high",
  "budget_range": "$120k - $150k",
  "timeline_weeks": 8,
  "required_skills": ["Python", "React", "AWS"],
  "preferred_skills": ["Docker", "Kubernetes"]
}
```

### Resume Scanner Endpoints

#### POST /api/resume-scanner/analyze
Analyze a resume using AI.

**Request Body:**
```json
{
  "resume_file": "base64_encoded_file",
  "job_description": "We are looking for...",
  "analysis_type": "comprehensive"
}
```

**Response:**
```json
{
  "candidate_score": 85.5,
  "skill_matches": [
    {
      "skill": "Python",
      "match_percentage": 90,
      "experience_level": "expert"
    }
  ],
  "recommendations": [
    "Strong technical background",
    "Good cultural fit"
  ],
  "risk_factors": [
    "Limited leadership experience"
  ]
}
```

## 🔒 Security Features

### Input Validation
- Comprehensive sanitization of all inputs
- XSS protection
- SQL injection prevention
- File upload validation

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Session management
- Password policies

### Rate Limiting
- Per-IP rate limiting
- API endpoint throttling
- Burst protection
- Automatic blocking of suspicious IPs

### Anti-Cheat System
- Real-time monitoring during coding tests
- Keystroke analysis
- Focus change detection
- Network activity monitoring
- Plagiarism detection

## 📊 Monitoring & Observability

### Metrics
- API request/response metrics
- Business metrics (hiring requests, candidates)
- System metrics (CPU, memory, database)
- Security metrics (failed logins, suspicious activities)

### Logging
- Structured logging with JSON format
- Google Cloud Logging integration
- Audit trail for all actions
- Error tracking and reporting

### Tracing
- Distributed tracing with OpenTelemetry
- Request flow visualization
- Performance bottleneck identification
- Error correlation

### Alerting
- Performance degradation alerts
- Security incident notifications
- Business metric thresholds
- Infrastructure health monitoring

## 🚀 Deployment

### Google Cloud Platform Setup

1. **Enable Required APIs:**
```bash
gcloud services enable \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  storage.googleapis.com \
  aiplatform.googleapis.com \
  pubsub.googleapis.com \
  cloudkms.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com
```

2. **Create Infrastructure:**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

3. **Deploy Application:**
```bash
# Build and push Docker images
docker build -t gcr.io/PROJECT_ID/hiring-platform-backend ./backend
docker build -t gcr.io/PROJECT_ID/hiring-platform-frontend ./frontend

docker push gcr.io/PROJECT_ID/hiring-platform-backend
docker push gcr.io/PROJECT_ID/hiring-platform-frontend

# Deploy to Cloud Run
gcloud run deploy hiring-platform-backend \
  --image gcr.io/PROJECT_ID/hiring-platform-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy hiring-platform-frontend \
  --image gcr.io/PROJECT_ID/hiring-platform-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### CI/CD Pipeline

The project includes a comprehensive GitHub Actions CI/CD pipeline:

1. **Security Scanning** - Code quality and vulnerability checks
2. **Testing** - Unit and integration tests
3. **Building** - Docker image creation
4. **Deployment** - Automatic deployment to staging/production
5. **Monitoring** - Performance and security monitoring

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app --cov-report=html
```

### Frontend Tests
```bash
cd frontend
npm test -- --coverage
```

### Performance Tests
```bash
cd backend/tests/performance
locust -f locustfile.py --host=http://localhost:8000
```

## 📈 Performance

### Benchmarks
- **API Response Time**: < 200ms (95th percentile)
- **Database Queries**: < 50ms average
- **AI Operations**: < 5s for complex analysis
- **Concurrent Users**: 1000+ supported

### Optimization
- Database connection pooling
- Redis caching
- CDN for static assets
- Image optimization
- Code splitting

## 🔧 Development

### Code Style
- **Backend**: Black, isort, pylint
- **Frontend**: ESLint, Prettier
- **Git**: Conventional commits

### Git Workflow
1. Create feature branch from `develop`
2. Make changes and write tests
3. Run linting and tests
4. Create pull request
5. Code review and merge

### Local Development
```bash
# Start all services with Docker Compose
docker-compose up -d

# Run database migrations
alembic upgrade head

# Seed test data
python scripts/seed_data.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Write comprehensive tests
- Update documentation
- Add type hints
- Handle errors gracefully

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](http://localhost:8000/docs)
- [Architecture Guide](docs/architecture.md)
- [Security Guide](docs/security.md)
- [Deployment Guide](docs/deployment.md)

### Community
- [GitHub Issues](https://github.com/your-org/ai-hiring-platform/issues)
- [Discussions](https://github.com/your-org/ai-hiring-platform/discussions)
- [Wiki](https://github.com/your-org/ai-hiring-platform/wiki)

### Contact
- Email: support@hiring-platform.com
- Slack: #ai-hiring-platform

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core hiring platform features
- ✅ Security implementation
- ✅ GCP infrastructure
- ✅ CI/CD pipeline

### Phase 2 (Next)
- 🔄 Advanced AI features
- 🔄 Mobile application
- 🔄 Integration marketplace
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 Multi-tenant architecture
- 📋 Advanced ML models
- 📋 Blockchain integration
- 📋 Global expansion

---

**Built with ❤️ by the AI Hiring Platform Team** 