locals {
  # Flatten project IAM bindings into a list of objects containing a role and member
  project_iam_bindings_flat = flatten([
    for role, members in var.project_iam_bindings : [
      for member in members : {
        role   = role
        member = member
      }
    ]
  ])
}

resource "google_project_iam_member" "project_roles" {
  for_each = {
    for binding in local.project_iam_bindings_flat : "${binding.role}_${binding.member}" => binding
  }

  project = var.project_id
  role    = each.value.role
  
  # Replace placeholders so you don't have to hardcode project IDs
  member  = replace(each.value.member, "PROJECT_ID", var.project_id)
}
