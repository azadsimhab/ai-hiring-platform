# backend/main.py (Final version with clean mock data)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine

from . import models, schemas, crud
from .config import settings
from .database import Base


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Application startup...")
    global SessionLocal
    db_socket_dir = "/cloudsql"
    db_uri = (
        f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASS}@"
        f"/{settings.DB_NAME}?host={db_socket_dir}/{settings.INSTANCE_CONNECTION_NAME}"
    )
    engine = create_engine(db_uri)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("INFO:     Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("INFO:     Database tables created successfully.")
    yield
    print("INFO:     Application shutdown.")


SessionLocal = None

app = FastAPI(
    title="AI Hiring Platform API",
    description="API for managing the AI-powered hiring workflow.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- API Endpoints ---

@app.get("/", tags=["Health Check"])
def read_root():
    return {"message": "Hello from the AI Hiring Platform Backend!"}


@app.get("/api/v1/status", tags=["Health Check"])
def get_status():
    return {"status": "ok", "service": "Backend API"}


@app.post("/api/v1/hiring-requests", response_model=schemas.HiringRequest, tags=["Hiring Requests"])
def create_hiring_request_endpoint(
        request: schemas.HiringRequestCreate, db: Session = Depends(get_db)
):
    return crud.create_hiring_request(db=db, request=request)


@app.post("/api/v1/hiring-requests/parse-document", response_model=schemas.HiringRequestBase, tags=["Hiring Requests"])
async def parse_hiring_request_document(file: UploadFile = File(...)):
    print(f"INFO:     Received file: {file.filename}, content-type: {file.content_type}")

    # =================================================================
    # TODO: AI Integration Step (Future Implementation)
    # =================================================================

    # This mock data no longer has the "Parsed:" prefix.
    mock_extracted_data = {
        "job_title": "Senior AI Engineer (from Document)",
        "department": "Research and Development",
        "manager": "Dr. Eva Rostova",
        "level": "L5",
        "salary_range": "150,000 - 200,000 USD",
        "benefits_perks": "Full health coverage and unlimited PTO.",
        "locations": "Remote, USA",
        "urgency": "High",
        "other_remarks": f"Successfully parsed mock data from document: {file.filename}",
        "employment_type": "Permanent",
        "hiring_type": "External"
    }

    print(f"INFO:     Returning clean mock parsed data.")
    return mock_extracted_data