# Prometheus Deployment using Helm (kube-prometheus-stack)
# This deploys Prometheus, Alertmanager, Grafana, and related monitoring components

resource "helm_release" "prometheus" {
  name             = "kube-prometheus-stack"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = "65.0.0"
  namespace        = "monitoring"
  create_namespace = true
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/prometheus/values-override.yaml")
  ]

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

output "prometheus_server_service" {
  description = "Prometheus server service name"
  value       = "kube-prometheus-stack-prometheus"
}

output "prometheus_namespace" {
  description = "Namespace where Prometheus is deployed"
  value       = helm_release.prometheus.namespace
}

output "prometheus_port_forward_command" {
  description = "Command to access Prometheus UI via port-forward"
  value       = "kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090"
}

output "alertmanager_port_forward_command" {
  description = "Command to access Alertmanager UI via port-forward"
  value       = "kubectl port-forward svc/kube-prometheus-stack-alertmanager -n monitoring 9093:9093"
}

output "grafana_prometheus_port_forward_command" {
  description = "Command to access Grafana UI (from kube-prometheus-stack) via port-forward"
  value       = "kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80"
}
