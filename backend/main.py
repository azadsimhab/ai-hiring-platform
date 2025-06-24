import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
import google.generativeai as genai
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
    genai.configure(api_key=settings.GOOGLE_API_KEY)
    print("INFO:     Google Generative AI client configured.")
    global SessionLocal
    db_socket_dir = "/cloudsql"
    db_uri = f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASS}@/{settings.DB_NAME}?host={db_socket_dir}/{settings.INSTANCE_CONNECTION_NAME}"
    engine = create_engine(db_uri)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("INFO:     Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("INFO:     Database tables created successfully.")
    yield
    print("INFO:     Application shutdown.")


SessionLocal = None
app = FastAPI(title="AI Hiring Platform API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"],
                   allow_headers=["*"])


@app.get("/", tags=["Health Check"])
def read_root(): return {"message": "Hello from the AI Hiring Platform Backend!"}


@app.get("/api/v1/status", tags=["Health Check"])
def get_status(): return {"status": "ok", "service": "Backend API"}


@app.post("/api/v1/hiring-requests", response_model=schemas.HiringRequest, tags=["Hiring Requests"])
def create_hiring_request_endpoint(request: schemas.HiringRequestCreate, db: Session = Depends(get_db)):
    return crud.create_hiring_request(db=db, request=request)


@app.post("/api/v1/hiring-requests/parse-document", response_model=schemas.HiringRequestBase, tags=["Hiring Requests"])
async def parse_hiring_request_document(file: UploadFile = File(...)):
    print(f"INFO:     Received file for parsing: {file.filename}")
    try:
        file_contents = await file.read()
        model = genai.GenerativeModel("gemini-1.5-flash")  # Use stable multimodal model
        prompt = "You are an expert HR assistant. Analyze the document and extract hiring request details into a JSON object with these exact keys: job_title, department, manager, level, salary_range, benefits_perks, locations, urgency, other_remarks, employment_type, hiring_type. Use null for missing fields. Respond with ONLY the raw JSON object."

        response = await model.generate_content_async([prompt, {"mime_type": file.content_type, "data": file_contents}])

        response_text = response.text.strip().replace("```json", "").replace("```", "")
        parsed_data = json.loads(response_text)

        print("INFO:     Successfully parsed data from API.")
        return parsed_data
    except Exception as e:
        print(f"ERROR:    An error occurred during AI parsing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to parse document with AI: {str(e)}")