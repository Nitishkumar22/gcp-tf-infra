output "service_accounts" {
  description = "Map of created Service Account emails"
  value = {
    for id, sa in google_service_account.service_accounts : id => sa.email
  }
}

output "workload_identity_providers" {
  description = "Map of created Workload Identity Provider IDs"
  value = {
    for key, provider in google_iam_workload_identity_pool_provider.providers : key => provider.name
  }
}
