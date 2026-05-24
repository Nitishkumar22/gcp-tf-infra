resource "google_compute_network" "vpc_network" {
  project                 = var.project_id
  name                    = "cinemates-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

resource "google_compute_subnetwork" "gke_subnet" {
  name    = "cinemates-gke-subnet"
  project = var.project_id
  region  = var.region
  network = google_compute_network.vpc_network.self_link

  # Primary range: GKE worker nodes (VMs) get IPs from here
  ip_cidr_range = "10.0.0.0/24"

  # Secondary ranges required for VPC-native GKE cluster
  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = "10.48.0.0/14"
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = "10.52.0.0/20"
  }
}