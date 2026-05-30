# Get VPC network and subnet IDs from the vpc module's remote state
data "terraform_remote_state" "vpc" {
  backend   = "gcs"
  workspace = terraform.workspace
  config = {
    bucket = "cinemates-tf-state"
    prefix = "vpc"
  }
}

# Locals for common labels/tags
locals {
  common_labels = {
    project     = var.project_name
    environment = var.environment
    region      = var.region
    managed-by  = "terraform"
    component   = "gke"
  }
  
  # Merge common labels with custom labels (custom labels override common if duplicate)
  all_labels = merge(local.common_labels, var.labels)
}

# GKE cluster (Standard mode with manual node pool management)
# url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_cluster
resource "google_container_cluster" "gke_cluster" {
  name     = "${var.name}-gke-cluster"
  location = var.region
  project  = var.project_id
  
  min_master_version       = var.gke_version
  remove_default_node_pool = true
  initial_node_count       = 1

  network    = data.terraform_remote_state.vpc.outputs.vpc_network_id
  subnetwork = data.terraform_remote_state.vpc.outputs.gke_subnet_id

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }

  resource_labels = local.all_labels

  deletion_protection = false
}

# Node pool
# url: https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/container_node_pool
resource "google_container_node_pool" "gke_node_pool" {
  name       = "${var.name}-gke-node-pool"
  cluster    = google_container_cluster.gke_cluster.id
  node_count = var.node_count
  version    = var.gke_version

  node_config {
    preemptible  = true
    machine_type = "e2-medium"
    
    labels = local.all_labels

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform"
    ]
  }
}
