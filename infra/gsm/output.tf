output "secret_id" {
  description = "The ID of the secret"
  value       = google_secret_manager_secret.secret.secret_id
}

output "secret_name" {
  description = "The full resource name of the secret"
  value       = google_secret_manager_secret.secret.name
}

output "secret_project" {
  description = "The project ID where the secret is stored"
  value       = google_secret_manager_secret.secret.project
}
