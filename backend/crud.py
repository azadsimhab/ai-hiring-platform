from sqlalchemy.orm import Session
from . import models, schemas


def create_hiring_request(db: Session, request: schemas.HiringRequestCreate) -> models.HiringRequest:
    """
    Creates a new hiring request record in the database.

    This function takes the validated data from the API and creates a new
    database object, commits it, and returns the new object.

    Args:
        db (Session): The database session provided by the API dependency.
        request (schemas.HiringRequestCreate): The validated hiring request data.

    Returns:
        models.HiringRequest: The SQLAlchemy model instance of the newly created request.
    """
    # Create a new SQLAlchemy model instance from the Pydantic schema data
    # The **request.model_dump() unpacks the Pydantic model into a dictionary
    db_request = models.HiringRequest(**request.model_dump())

    # Add the new instance to the session, staging it for commit
    db.add(db_request)

    # Commit the session to write the changes to the database
    db.commit()

    # Refresh the instance to get any new data from the database, like the auto-generated ID
    db.refresh(db_request)

    return db_request