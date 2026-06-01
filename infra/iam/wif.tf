resource "google_iam_workload_identity_pool" "pools" {
  for_each = var.workload_identity_pools

  project                   = var.project_id
  workload_identity_pool_id = each.key
  display_name              = each.value.display_name
  description               = each.value.description
}

locals {
  # Flatten Workload Identity Providers so we can loop over them easily
  wif_providers_flat = flatten([
    for pool_id, pool in var.workload_identity_pools : [
      for provider_id, provider in pool.providers : {
        pool_id             = pool_id
        provider_id         = provider_id
        display_name        = provider.display_name
        description         = provider.description
        attribute_mapping   = provider.attribute_mapping
        attribute_condition = provider.attribute_condition
        issuer_uri          = provider.issuer_uri
      }
    ]
  ])
}

resource "google_iam_workload_identity_pool_provider" "providers" {
  for_each = {
    for provider in local.wif_providers_flat : "${provider.pool_id}_${provider.provider_id}" => provider
  }

  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.pools[each.value.pool_id].workload_identity_pool_id
  workload_identity_pool_provider_id = each.value.provider_id
  display_name                       = each.value.display_name
  description                        = each.value.description

  attribute_mapping   = each.value.attribute_mapping
  attribute_condition = each.value.attribute_condition

  oidc {
    issuer_uri = each.value.issuer_uri
  }
}
