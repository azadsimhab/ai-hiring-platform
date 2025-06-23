# backend/main.py (FINAL Corrected Version - Fixes Database Name in Connection String)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# Import all the modules we've created
from . import models, schemas, crud
from .config import settings
from .database import Base


# This function will now handle our database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# This lifespan function will run code on application startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Application startup...")

    global SessionLocal

    db_socket_dir = "/cloudsql"
    # THE FIX IS HERE: Adding the database name to the connection string.
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


# Define SessionLocal globally but initialize it in the lifespan event
SessionLocal = None

app = FastAPI(
    title="AI Hiring Platform API",
    description="API for managing the AI-powered hiring workflow.",
    version="1.0.0",
    lifespan=lifespan
)

# Allow CORS for frontend access
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
    """ A simple root endpoint to confirm the API is running. """
    return {"message": "Hello from the AI Hiring Platform Backend!"}


@app.get("/api/v1/status", tags=["Health Check"])
def get_status():
    """ Returns the operational status of the API. """
    return {"status": "ok", "service": "Backend API"}


@app.post("/api/v1/hiring-requests", response_model=schemas.HiringRequest, tags=["Hiring Requests"])
def create_hiring_request_endpoint(
        request: schemas.HiringRequestCreate, db: Session = Depends(get_db)
):
    return crud.create_hiring_request(db=db, request=request)