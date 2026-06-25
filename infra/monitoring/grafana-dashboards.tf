# url: https://registry.terraform.io/providers/grafana/grafana/latest/docs/resources/folder

resource "grafana_folder" "folders" {
  for_each = toset(var.grafana_folders)
  title    = each.value

  depends_on = [helm_release.prometheus]
}

locals {
  dashboard_configs = {
    "gke_cluster_overview.json" = { folder = "Kubernetes" }
    "pod_detail.json"           = { folder = "Kubernetes" }
    "node_detail.json"          = { folder = "Kubernetes" }
    "loki_log_explorer.json"    = { folder = "Logs" }
    "error_rate_logs.json"      = { folder = "Logs" }
    # next dashboard just add one line here
  }
}

# url: https://registry.terraform.io/providers/grafana/grafana/latest/docs/resources/dashboard

resource "grafana_dashboard" "this" {
  for_each = local.dashboard_configs

  folder      = grafana_folder.folders[each.value.folder].uid
  overwrite   = true
  config_json = file("${path.module}/grafana-dashboards/${each.key}")

  depends_on = [grafana_folder.folders]
}

