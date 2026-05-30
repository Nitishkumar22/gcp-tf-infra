# Google Secret Manager
# url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/secret_manager_secret

resource "google_secret_manager_secret" "secret" {
  secret_id = var.secret_id
  project   = var.project_id
  labels    = local.all_labels
  
  replication {
    user_managed {
      replicas {
        location = var.region
      }
      replicas {
        location = "us-west1"
      }
    }
  }
  deletion_protection = false
}