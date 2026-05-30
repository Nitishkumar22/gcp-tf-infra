# Locals for common labels/tags
locals {
  common_labels = {
    project     = var.project_name
    environment = var.environment
    region      = var.region
    managed-by  = "terraform"
    component   = "secret-manager"
  }
  
  # Merge common labels with custom labels (custom labels override common if duplicate)
  all_labels = merge(local.common_labels, var.labels)
}
