# ArgoCD Deployment using Helm
# This deploys ArgoCD to the GKE cluster for GitOps-based application delivery

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "7.7.12"
  namespace        = "argocd"
  create_namespace = true
  timeout          = 600
  wait             = true

  values = [
    file("${path.module}/charts/argocd/value.yaml")
  ]

  depends_on = [
    data.terraform_remote_state.gke
  ]
}

# Output the ArgoCD server service details
output "argocd_server_service" {
  description = "ArgoCD server service name"
  value       = "argocd-server"
}

output "argocd_namespace" {
  description = "Namespace where ArgoCD is deployed"
  value       = helm_release.argocd.namespace
}

output "argocd_admin_password_command" {
  description = "Command to retrieve ArgoCD admin password"
  value       = "kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d"
}

output "argocd_port_forward_command" {
  description = "Command to access ArgoCD UI via port-forward"
  value       = "kubectl port-forward svc/argocd-server -n argocd 8080:443"
}
