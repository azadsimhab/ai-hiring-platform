# infrastructure/main.tf (FINAL - For CI/CD Execution)

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

resource "google_sql_database_instance" "main_instance" {
  name             = "hiring-platform-main-db"
  database_version = "POSTGRES_14"
  region           = var.gcp_region
  project          = var.gcp_project_id
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
  replication {
    auto {}
  }
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

resource "google_artifact_registry_repository" "backend_repo" {
  location      = var.gcp_region
  repository_id = "ai-hiring-platform-backend"
  description   = "Docker repository for backend service"
  format        = "DOCKER"
  project       = var.gcp_project_id
}

resource "google_artifact_registry_repository" "frontend_repo" {
  location      = var.gcp_region
  repository_id = "ai-hiring-platform-frontend"
  description   = "Docker repository for frontend service"
  format        = "DOCKER"
  project       = var.gcp_project_id
}

resource "google_cloud_run_v2_service" "backend_service" {
  name     = "api-backend"
  location = var.gcp_region
  project  = var.gcp_project_id
  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
  depends_on = [google_sql_database_instance.main_instance]
}

resource "google_cloud_run_v2_service" "frontend_service" {
  name     = "frontend-ui"
  location = var.gcp_region
  project  = var.gcp_project_id
  template {
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
    }
  }
}