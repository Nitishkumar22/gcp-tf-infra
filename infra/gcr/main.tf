# Artifact Registry repositories for Docker images
# url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository
resource "google_artifact_registry_repository" "repos" {
  for_each = var.repositories

  repository_id = "${var.project_name}-${each.key}"
  project       = var.project_id
  description   = each.value.description
  location      = var.region
  format        = each.value.format

  labels = merge(local.all_labels, {
    repository = each.key
  })
}



