resource "google_compute_network" "vpc_network" {
    project = var.project_id
    name = "cinemates-vpc"
    auto_create_subnetworks = false
    routing_mode = "GLOBAL"
}