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

variable "secret_id" {
  description = "ID of the secret to create"
  type        = string
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

