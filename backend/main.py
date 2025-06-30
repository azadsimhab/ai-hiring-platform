import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
import vertexai
from vertexai.generative_models import GenerativeModel, Part

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
    print("INFO: Initializing application...")
    vertexai.init(project=settings.GCP_PROJECT_ID, location=settings.GCP_REGION)
    print("INFO: Vertex AI client initialized.")
    global SessionLocal
    db_socket_dir = "/cloudsql"
    db_uri = f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASS}@/{settings.DB_NAME}?host={db_socket_dir}/{settings.INSTANCE_CONNECTION_NAME}"
    engine = create_engine(db_uri)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("INFO: Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("INFO: Database tables verified/created. Application startup complete.")
    yield
    print("INFO: Application shutdown.")


SessionLocal = None
app = FastAPI(title="AI Hiring Platform API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])


@app.get("/", include_in_schema=False)
def read_root(): return {"message": "AI Hiring Platform Backend is running."}


@app.post("/api/v1/hiring-requests", response_model=schemas.HiringRequest, tags=["Hiring Requests"])
def create_hiring_request_endpoint(request: schemas.HiringRequestCreate, db: Session = Depends(get_db)):
    return crud.create_hiring_request(db=db, request=request)


@app.post("/api/v1/hiring-requests/parse-document", response_model=schemas.HiringRequestBase, tags=["Hiring Requests"])
async def parse_hiring_request_document(file: UploadFile = File(...)):
    print(f"INFO: Received file for parsing: {file.filename}")
    try:
        file_contents = await file.read()
        model = GenerativeModel("gemini-1.5-flash")
        prompt = "You are an expert HR assistant. Analyze the provided document and extract hiring request details into a JSON object with these exact keys: job_title, department, manager, level, salary_range, benefits_perks, locations, urgency, other_remarks, employment_type, hiring_type. Use null for missing fields. Respond with ONLY the raw JSON object."

        request_parts = [Part.from_data(data=file_contents, mime_type=file.content_type), prompt]

        print("INFO: Sending document to Vertex AI Gemini for parsing...")
        response = await model.generate_content_async(request_parts)

        response_text = response.text.strip().replace("```json", "").replace("```", "")
        parsed_data = json.loads(response_text)

        print("INFO: Successfully parsed data from Gemini API.")
        return parsed_data
    except Exception as e:
        print(f"ERROR: An error occurred during AI parsing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse document with AI: {str(e)}")