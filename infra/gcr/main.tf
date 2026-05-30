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


# # Service Account for Kubernetes to pull images from Artifact Registry
# # url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account
# resource "google_service_account" "artifact_reader" {
#   account_id   = "${var.project_name}-${var.environment}-artifact-reader"
#   display_name = "Artifact Registry Reader for Kubernetes"
#   description  = "Service account with minimal permissions to pull images from Artifact Registry"
#   project      = var.project_id
# }

# # Grant Artifact Registry Reader role (minimum permission to pull images)
# # url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/artifact_registry_repository_iam
# resource "google_artifact_registry_repository_iam_member" "reader" {
#   for_each = google_artifact_registry_repository.repos

#   project    = each.value.project
#   location   = each.value.location
#   repository = each.value.name
#   role       = "roles/artifactregistry.reader"
#   member     = "serviceAccount:${google_service_account.artifact_reader.email}"
# }

# # Create service account key for Kubernetes imagePullSecrets
# # url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account_key
# resource "google_service_account_key" "artifact_reader_key" {
#   service_account_id = google_service_account.artifact_reader.name
# }
