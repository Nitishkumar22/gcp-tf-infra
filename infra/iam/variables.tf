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

# ==========================================
# IAM Variables
# ==========================================

variable "service_accounts" {
  description = "Map of Service Accounts to create. Key is account_id."
  type = map(object({
    display_name = string
    description  = string
  }))
  default = {}
}

variable "workload_identity_pools" {
  description = "Map of Workload Identity Pools. Key is pool_id."
  type = map(object({
    display_name = string
    description  = string
    providers = map(object({
      display_name        = string
      description         = string
      attribute_mapping   = map(string)
      attribute_condition = string
      issuer_uri          = string
    }))
  }))
  default = {}
}

variable "project_iam_bindings" {
  description = "Map of roles to list of members for project-level IAM. You can use 'PROJECT_ID' as a placeholder in member strings."
  type        = map(list(string))
  default     = {}
}

variable "service_account_iam_bindings" {
  description = "Map of Service Account IDs (keys from service_accounts) to role-to-members map. You can use 'PROJECT_NUMBER' and 'PROJECT_ID' placeholders in member strings."
  type        = map(map(list(string)))
  default     = {}
}
