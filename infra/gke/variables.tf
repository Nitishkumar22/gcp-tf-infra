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

variable "zone" {
  description = "GCP Zone for the zonal cluster"
  type        = string
  default     = "us-east1-b"
}

variable "gke_version" {
  description = "Kubernetes version for GKE cluster"
  type        = string
  default     = "1.33"
}

variable "node_pools" {
  description = "Map of node pool configurations"
  type = map(object({
    node_count   = number
    machine_type = string
    preemptible  = bool
    disk_size_gb = number
    disk_type    = string
  }))
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
