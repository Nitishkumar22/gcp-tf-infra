# Loki Deployment using Helm
# This deploys Loki for log aggregation and querying

resource "helm_release" "loki" {
  name             = "loki"
  repository       = "https://grafana.github.io/helm-charts"
  chart            = "loki"
  version          = "6.23.0"
  namespace        = "monitoring"
  create_namespace = true
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/loki/values-override.yaml")
  ]

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

# Promtail Deployment for log collection
resource "helm_release" "promtail" {
  name       = "promtail"
  repository = "https://grafana.github.io/helm-charts"
  chart      = "promtail"
  version    = "6.16.6"
  namespace  = "monitoring"
  timeout    = 600
  wait       = true

  values = [
    file("${path.module}/charts/promtail/values-override.yaml")
  ]

  depends_on = [
    helm_release.loki
  ]
}

output "loki_server_service" {
  description = "Loki server service name"
  value       = "loki"
}

output "loki_namespace" {
  description = "Namespace where Loki is deployed"
  value       = helm_release.loki.namespace
}

output "loki_port_forward_command" {
  description = "Command to access Loki via port-forward"
  value       = "kubectl port-forward svc/loki -n monitoring 3100:3100"
}

output "promtail_daemonset" {
  description = "Promtail DaemonSet name"
  value       = "promtail"
}
