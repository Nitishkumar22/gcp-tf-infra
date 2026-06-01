project_id   = "cinemates-497209"
project_name = "cinemates"
region       = "us-east1"
environment  = "dev"

# ==========================================
# Service Accounts
# ==========================================
service_accounts = {
  "github-actions-sa" = {
    display_name = "GitHub Actions Service Account"
    description  = "Service account used by GitHub Actions pipeline"
  }
}

# ==========================================
# Workload Identity Federation
# ==========================================
workload_identity_pools = {
  "github-actions-pool" = {
    display_name = "GitHub Actions Pool"
    description  = "Identity pool for GitHub Actions authentication"
    providers = {
      "github-actions-provider" = {
        display_name = "GitHub Actions Provider"
        description  = "OIDC identity provider for GitHub Actions"
        issuer_uri   = "https://token.actions.githubusercontent.com"
        attribute_mapping = {
          "google.subject"       = "assertion.sub"
          "attribute.actor"      = "assertion.actor"
          "attribute.repository" = "assertion.repository"
        }
        attribute_condition = "attribute.repository == \"tenex-ai/gcp-tf-infra\""
      }
    }
  }
}

# ==========================================
# Role Assignments (IAM Bindings)
# ==========================================
project_iam_bindings = {
  "roles/artifactregistry.writer" = [
    # Notice we can use PROJECT_ID placeholder instead of hardcoding
    "serviceAccount:github-actions-sa@PROJECT_ID.iam.gserviceaccount.com"
  ]
}

# ==========================================
# Service Account Impersonation
# ==========================================
service_account_iam_bindings = {
  "github-actions-sa" = {
    "roles/iam.workloadIdentityUser" = [
      # Notice we can use PROJECT_NUMBER placeholder instead of hardcoding the numeric ID
      "principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/tenex-ai/gcp-tf-infra"
    ]
  }
}
