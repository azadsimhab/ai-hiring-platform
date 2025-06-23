from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import all the modules we've created
from . import models, schemas, crud
from .database import engine, get_db

# This command tells SQLAlchemy to create all tables defined in models.py
# It will check if the table exists first before creating.
models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Hiring Platform API",
    description="API for managing the AI-powered hiring workflow.",
    version="1.0.0",
)

# Allow CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, change this to your frontend URL
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