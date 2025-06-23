# backend/crud.py (Corrected to handle both Pydantic models and dictionaries)

from sqlalchemy.orm import Session
from . import models, schemas


def create_hiring_request(db: Session, request: schemas.HiringRequestCreate) -> models.HiringRequest:
    """
    Creates a new hiring request record in the database.

    This function now robustly handles either a Pydantic model or a dictionary.

    Args:
        db (Session): The database session provided by the API dependency.
        request (schemas.HiringRequestCreate): The validated hiring request data.

    Returns:
        models.HiringRequest: The SQLAlchemy model instance of the newly created request.
    """
    # THE FIX IS HERE: We check if the input has 'model_dump' (is a Pydantic model).
    # If not, we assume it's already a dictionary.
    if hasattr(request, 'model_dump'):
        request_data = request.model_dump()
    else:
        request_data = request

    # Create a new SQLAlchemy model instance from the data
    db_request = models.HiringRequest(**request_data)

    # Add the new instance to the session, staging it for commit
    db.add(db_request)

    # Commit the session to write the changes to the database
    db.commit()

    # Refresh the instance to get any new data from the database, like the auto-generated ID
    db.refresh(db_request)

    return db_request