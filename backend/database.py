from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings # Import the settings object

# --- Database Connection String ---
# Now constructed from our centralized settings object
db_socket_dir = "/cloudsql"
SQLALCHEMY_DATABASE_URL = (
    f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASS}@"
    f"?host={db_socket_dir}/{settings.INSTANCE_CONNECTION_NAME}"
)


# --- SQLAlchemy Engine Setup ---
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# --- Dependency for FastAPI ---
def get_db():
    """
    A dependency function that creates and yields a new database session
    for each incoming API request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()