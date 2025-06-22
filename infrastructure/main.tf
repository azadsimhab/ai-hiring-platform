# infrastructure/main.tf (Corrected)

terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "The GCP project ID."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region for resources."
  type        = string
  default     = "us-central1"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

# Enable necessary APIs for the project
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "firebasehosting.googleapis.com",
    "sqladmin.googleapis.com"
  ])
  project = var.gcp_project_id
  service = each.key
  # The 'disable_dependency_violation' argument is removed as it's no longer needed.
}

# Create the Artifact Registry for our Docker images
resource "google_artifact_registry_repository" "backend_repo" {
  provider      = google
  location      = var.gcp_region
  repository_id = "ai-hiring-platform-backend"
  description   = "Docker repository for backend service"
  format        = "DOCKER"
  depends_on    = [google_project_service.apis]
}

# Define the Cloud Run service for our backend
resource "google_cloud_run_v2_service" "backend_service" {
  provider   = google
  name       = "api-backend"
  location   = var.gcp_region
  depends_on = [google_project_service.apis]

  template {
    containers {
      # THE FIX IS HERE: Use a public placeholder image for initial creation.
      # Our CI/CD pipeline will deploy our actual image over this later.
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
}

# Make the Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "allow_public" {
  provider = google
  location = google_cloud_run_v2_service.backend_service.location
  project  = google_cloud_run_v2_service.backend_service.project
  service  = google_cloud_run_v2_service.backend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the URL of the deployed backend service
output "backend_service_url" {
  description = "URL of the backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend_service.uri
}