# VPC Network
resource "google_compute_network" "vpc_network" {
  project                 = var.project_id
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false
  routing_mode            = "GLOBAL"
}

# GKE Subnet
resource "google_compute_subnetwork" "gke_subnet" {
  name    = "${var.project_name}-gke-subnet"
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

# Cloud Router
# url : https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_router
resource "google_compute_router" "gke_router" {
  name    = "${var.project_name}-gke-router"
  project = var.project_id
  region  = var.region
  network = google_compute_network.vpc_network.self_link

  bgp {
    asn = 64514
  }
}

# Cloud NAT
# url : https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_router_nat

resource "google_compute_router_nat" "nat" {
  name                               = "${var.project_name}-nat"
  router                             = google_compute_router.gke_router.name
  region                             = google_compute_router.gke_router.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}
