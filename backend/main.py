from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import all the modules we've created
from . import models, schemas, crud
from .database import engine, get_db

# This lifespan function will run code on application startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("INFO:     Application startup...")
    # On startup, create the database tables
    print("INFO:     Creating database tables...")
    # The line below is now safely inside the startup event
    models.Base.metadata.create_all(bind=engine)
    print("INFO:     Database tables created successfully.")
    yield
    # Code below yield runs on shutdown
    print("INFO:     Application shutdown.")


# Pass the lifespan function to the FastAPI app
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
    """
    Creates a new hiring request.

    This endpoint receives the details of a hiring request in the request body,
    validates it using the `HiringRequestCreate` schema, and saves it
    to the database using our CRUD function.
    """
    return crud.create_hiring_request(db=db, request=request)