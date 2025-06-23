terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
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

# --- Enabling APIs ---
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com",
    "firebasehosting.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com"
  ])
  project            = var.gcp_project_id
  service            = each.key
  disable_on_destroy = false
}

# --- Database Resources ---
resource "google_sql_database_instance" "main_instance" {
  name             = "hiring-platform-main-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region
  project          = var.gcp_project_id
  depends_on       = [google_project_service.apis]

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
    }
  }
}

resource "google_sql_database" "hiring_db" {
  name     = "hiring_platform_db"
  instance = google_sql_database_instance.main_instance.name
  project  = var.gcp_project_id
}

resource "random_password" "db_user_password" {
  length  = 24
  special = true
}

resource "google_secret_manager_secret" "db_password_secret" {
  secret_id = "db-user-password"
  project   = var.gcp_project_id

  # THE FINAL FIX IS HERE: The block is named 'auto', not 'automatic'.
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password_secret_version" {
  secret      = google_secret_manager_secret.db_password_secret.id
  secret_data = random_password.db_user_password.result
}

resource "google_sql_user" "db_user" {
  name     = "hiring_app_user"
  instance = google_sql_database_instance.main_instance.name
  password = random_password.db_user_password.result
  project  = var.gcp_project_id
}


# --- Application Resources ---
resource "google_artifact_registry_repository" "backend_repo" {
  location      = var.gcp_region
  repository_id = "ai-hiring-platform-backend"
  description   = "Docker repository for backend service"
  format        = "DOCKER"
  project       = var.gcp_project_id
  depends_on    = [google_project_service.apis]
}

resource "google_cloud_run_v2_service" "backend_service" {
  name     = "api-backend"
  location = var.gcp_region
  project  = var.gcp_project_id

  template {
    annotations = {
      "run.googleapis.com/sql-socket-path" = "/cloudsql/${google_sql_database_instance.main_instance.connection_name}"
    }
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
  depends_on = [google_sql_database_instance.main_instance]
}


# --- Permissions ---
resource "google_cloud_run_service_iam_member" "allow_public" {
  location = google_cloud_run_v2_service.backend_service.location
  project  = google_cloud_run_v2_service.backend_service.project
  service  = google_cloud_run_v2_service.backend_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_secret_manager_secret_iam_member" "allow_run_access_secret" {
  project   = google_secret_manager_secret.db_password_secret.project
  secret_id = google_secret_manager_secret.db_password_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:83797326158-compute@developer.gserviceaccount.com"
}

resource "google_project_iam_member" "allow_run_connect_sql" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:83797326158-compute@developer.gserviceaccount.com"
}


# --- Outputs ---
output "backend_service_url" {
  description = "URL of the backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend_service.uri
}

output "db_instance_connection_name" {
  description = "The connection name of the Cloud SQL instance for the application."
  value       = google_sql_database_instance.main_instance.connection_name
  sensitive   = true
}