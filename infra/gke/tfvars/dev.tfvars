project_id   = "cinemates-497209"
project_name = "cinemates"
region       = "us-east1"
gke_version  = "1.33"
environment  = "dev"


node_pools = {
  "nodepool-1" = {
    node_count   = 1
    machine_type = "e2-medium"
    preemptible  = true
  }
}


labels = {
  team        = "platform"
  cost-center = "engineering"
  managed-by  = "terraform"
}
