FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# THIS IS THE FIX: Run the application as a module 'backend.main'
# This tells Uvicorn to look for the 'app' object in the 'main.py' file
# inside the 'backend' package.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]