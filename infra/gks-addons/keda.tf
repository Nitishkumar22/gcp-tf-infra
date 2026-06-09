# KEDA Deployment using Helm
# This deploys KEDA to the GKE cluster for event-driven autoscaling

resource "helm_release" "keda" {
  name             = "keda"
  repository       = "https://kedacore.github.io/charts"
  chart            = "keda"
  version          = "2.20.0"
  namespace        = "keda"
  create_namespace = true
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/keda/value.yaml")
  ]

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

# Output the KEDA deployment details
output "keda_deployment" {
  description = "KEDA deployment name"
  value       = helm_release.keda.name
}

# Output the KEDA namespace
output "keda_namespace" {
  description = "KEDA namespace"
  value       = helm_release.keda.namespace
}

# Keda chart version
output "keda_chart_version" {
  description = "KEDA chart version"
  value       = helm_release.keda.version
}


