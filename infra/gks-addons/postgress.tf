# Fetch PostgreSQL password from existing Google Secret Manager secret
data "google_secret_manager_secret_version" "postgres_password" {
  secret  = "POSTGRES_DB_PASSWORD"
  project = var.project_id
}

resource "helm_release" "postgresql" {
  name             = "postgresql"
  repository       = "https://charts.bitnami.com/bitnami"
  chart            = "postgresql"
  namespace        = "database"
  create_namespace = true
  version          = "15.5.0"
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/postgresql/value.yaml")
  ]

  set_sensitive {
    name  = "auth.postgresPassword"
    value = data.google_secret_manager_secret_version.postgres_password.secret_data
  }

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

# Output the PostgreSQL connection details
output "postgresql_connection" {
  description = "PostgreSQL connection string"
  value       = "postgresql://${helm_release.postgresql.name}:${data.google_secret_manager_secret_version.postgres_password.secret_data}@${helm_release.postgresql.name}-primary.database.svc.cluster.local:5432/${helm_release.postgresql.name}"
  sensitive   = true
}

output "postgresql_username" {
  description = "PostgreSQL username"
  value       = helm_release.postgresql.name
}

output "postgresql_password" {
  description = "PostgreSQL password"
  value       = data.google_secret_manager_secret_version.postgres_password.secret_data
  sensitive   = true
}

output "postgresql_database" {
  description = "PostgreSQL database name"
  value       = helm_release.postgresql.name
}

