output "cluster_name" {
  description = "The name of the GKE cluster"
  value       = google_container_cluster.gke_cluster.name
}

output "cluster_endpoint" {
  description = "The endpoint of the GKE cluster"
  value       = google_container_cluster.gke_cluster.endpoint
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "The CA certificate for the GKE cluster"
  value       = google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate
  sensitive   = true
}

output "cluster_location" {
  description = "The location (region/zone) of the GKE cluster"
  value       = google_container_cluster.gke_cluster.location
}

output "node_pool_names" {
  description = "The names of the GKE node pools"
  value       = [for pool in google_container_node_pool.gke_node_pool : pool.name]
}

output "kubeconfig" {
  description = "Kubeconfig for kubectl access"
  sensitive   = true
  value = templatefile("${path.module}/kubeconfig.tpl", {
    cluster_name           = google_container_cluster.gke_cluster.name
    cluster_endpoint       = google_container_cluster.gke_cluster.endpoint
    cluster_ca_certificate = google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate
    project_id             = var.project_id
    region                 = var.region
  })
}

output "kubectl_command" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.gke_cluster.name} --region=${var.region} --project=${var.project_id}"
}
