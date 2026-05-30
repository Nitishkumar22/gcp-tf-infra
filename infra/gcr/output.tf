output "repository_urls" {
  description = "URLs of the created Artifact Registry repositories"
  value = {
    for name, repo in google_artifact_registry_repository.repos :
    name => "${repo.location}-docker.pkg.dev/${repo.project}/${repo.repository_id}"
  }
}

output "repository_ids" {
  description = "IDs of the created repositories"
  value = {
    for name, repo in google_artifact_registry_repository.repos :
    name => repo.repository_id
  }
}

# output "service_account_email" {
#   description = "Email of the service account for pulling images"
#   value       = google_service_account.artifact_reader.email
# }

# output "service_account_key" {
#   description = "Base64 encoded service account key for Kubernetes imagePullSecrets"
#   value       = google_service_account_key.artifact_reader_key.private_key
#   sensitive   = true
# }

# output "kubernetes_secret_command" {
#   description = "Command to create Kubernetes imagePullSecret"
#   value       = <<-EOT
#     # Create Kubernetes secret for pulling images from Artifact Registry
#     kubectl create secret docker-registry artifact-registry-secret \
#       --docker-server=${var.region}-docker.pkg.dev \
#       --docker-username=_json_key \
#       --docker-password="$(terraform output -raw service_account_key | base64 -d)" \
#       --docker-email=${google_service_account.artifact_reader.email}
#   EOT
# }
