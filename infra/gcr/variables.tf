variable "project_name" {
  description = "name of the project"
  type        = string
}

variable "project_id" {
  description = "id of the project"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-east1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "labels" {
  description = "Additional custom labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "repositories" {
  description = "Map of Artifact Registry repositories to create"
  type = map(object({
    description = string
    format      = string
  }))
  default = {
    backend = {
      description = "Docker images for backend services"
      format      = "DOCKER"
    }
    frontend = {
      description = "Docker images for frontend applications"
      format      = "DOCKER"
    }
  }
}
