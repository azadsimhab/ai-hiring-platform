# backend/Dockerfile (FINAL Corrected Version)

FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file from the backend directory
# This path is now correct because our build context is the project root
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend package into the container's working directory
# This creates an /app/backend/ directory inside the container
COPY backend/ ./backend/

# Run the application as a module 'backend.main'
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]