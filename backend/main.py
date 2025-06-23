# backend/main.py (FINAL - Using a globally available Gemini 1.0 Pro Vision model)

import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine

# Google Cloud Vertex AI imports
import vertexai
from vertexai.generative_models import GenerativeModel, Part

from . import models, schemas, crud
from .config import settings
from .database import Base


# --- Dependency Functions ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Application Lifespan (Startup/Shutdown Events) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Application startup...")

    # Initialize Vertex AI Client
    vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_REGION)
    print("INFO:     Vertex AI client initialized.")

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


# --- FastAPI App Initialization ---
SessionLocal = None
app = FastAPI(
    title="AI Hiring Platform API",
    description="API for managing the AI-powered hiring workflow.",
    version="1.0.0",
    lifespan=lifespan
)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])


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
    print(f"INFO:     Received file for parsing: {file.filename}")

    try:
        file_contents = await file.read()

        # THE FIX IS HERE: Using the globally available Gemini 1.0 Pro Vision model.
        model = GenerativeModel("gemini-1.0-pro-vision")

        prompt = """
        You are an expert HR assistant. Your task is to analyze the provided hiring request document
        and extract the key information into a structured JSON object.

        The required JSON fields are: job_title, department, manager, level, salary_range,
        benefits_perks, locations, urgency, other_remarks, employment_type, and hiring_type.

        Analyze the document carefully. If a specific piece of information is not present
        in the document, use a null value for that field in the JSON output.
        Do not invent information. Your response must be only the JSON object, with no
        extra text, explanations, or markdown formatting.
        """

        request_parts = [
            Part.from_data(data=file_contents, mime_type=file.content_type),
            prompt
        ]

        print("INFO:     Sending document to Gemini API for parsing...")
        response = await model.generate_content_async(request_parts)

        response_text = response.text.strip().replace("```json", "").replace("```", "")
        parsed_data = json.loads(response_text)

        print("INFO:     Successfully parsed data from Gemini API.")
        return parsed_data

    except Exception as e:
        print(f"ERROR:    An error occurred during AI parsing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse document with AI: {str(e)}")