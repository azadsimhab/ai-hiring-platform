#!/bin/bash

# Production deployment script for AI Hiring Platform

set -e

echo "🚀 Deploying AI Hiring Platform to Google Cloud Run..."

# Set variables
PROJECT_ID="hiringagent"
SERVICE_NAME="hiring-platform-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Build and push Docker image
echo "📦 Building and pushing Docker image..."
gcloud builds submit --tag $IMAGE_NAME --project=$PROJECT_ID

# Deploy to Cloud Run
echo "�� Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 10 \
    --min-instances 1 \
    --port 8000 \
    --set-env-vars "EN 