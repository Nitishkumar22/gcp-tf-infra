# SonarQube Deployment using Helm
# This deploys SonarQube to the GKE cluster for code quality analysis

resource "helm_release" "sonarqube" {
  name             = "sonarqube"
  repository       = "https://SonarSource.github.io/helm-chart-sonarqube"
  chart            = "sonarqube"
  version          = "2026.3.1"
  namespace        = "sonarqube"
  create_namespace = true
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/sonarqube/value.yaml")
  ]

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

output "sonarqube_server_service" {
  description = "SonarQube server service name"
  value       = "sonarqube-sonarqube"
}

output "sonarqube_namespace" {
  description = "Namespace where SonarQube is deployed"
  value       = helm_release.sonarqube.namespace
}

output "sonarqube_port_forward_command" {
  description = "Command to access SonarQube UI via port-forward"
  value       = "kubectl port-forward svc/sonarqube-sonarqube -n sonarqube 9000:9000"
}
