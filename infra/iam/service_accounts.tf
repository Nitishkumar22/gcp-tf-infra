data "google_project" "current" {
  project_id = var.project_id
}

resource "google_service_account" "service_accounts" {
  for_each = var.service_accounts

  project      = var.project_id
  account_id   = each.key
  display_name = each.value.display_name
  description  = each.value.description
}

locals {
  # Flatten service account IAM bindings
  sa_iam_bindings_flat = flatten([
    for sa_id, roles in var.service_account_iam_bindings : [
      for role, members in roles : [
        for member in members : {
          sa_id  = sa_id
          role   = role
          member = member
        }
      ]
    ]
  ])
}

resource "google_service_account_iam_member" "sa_iam" {
  for_each = {
    for binding in local.sa_iam_bindings_flat : "${binding.sa_id}_${binding.role}_${binding.member}" => binding
  }

  service_account_id = google_service_account.service_accounts[each.value.sa_id].name
  role               = each.value.role

  # Replace placeholders so you don't have to hardcode project IDs and numbers in your tfvars
  member = replace(
    replace(each.value.member, "PROJECT_NUMBER", data.google_project.current.number),
    "PROJECT_ID", var.project_id
  )
}
