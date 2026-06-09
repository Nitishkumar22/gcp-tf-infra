# Monitoring Infrastructure

This directory contains Terraform configurations for deploying the monitoring stack to GKE.

## Components

### 1. **Prometheus** (`prometheus.tf`)
- Deploys `kube-prometheus-stack` which includes:
  - Prometheus for metrics collection
  - Alertmanager for alert management
  - Grafana for visualization
  - Node exporter for node metrics
  - Kube-state-metrics for Kubernetes metrics

### 2. **Loki** (`loki.tf`)
- Loki for log aggregation
- Promtail DaemonSet for log collection from all nodes

### 3. **Grafana** (`grafana.tf`)
- Standalone Grafana deployment for custom dashboards
- Can be used alongside the Grafana from kube-prometheus-stack

## Prerequisites

1. GKE cluster must be deployed (from `../gke`)
2. Terraform backend bucket must exist
3. GCP credentials configured

## Deployment

### Initialize Terraform
```bash
terraform init
```

### Select Workspace
```bash
terraform workspace select dev
# or
terraform workspace new dev
```

### Plan Deployment
```bash
terraform plan -var-file=tfvars/dev.tfvars
```

### Apply Configuration
```bash
terraform apply -var-file=tfvars/dev.tfvars
```

## Accessing Services

### Prometheus
```bash
kubectl port-forward svc/kube-prometheus-stack-prometheus -n monitoring 9090:9090
```
Access at: http://localhost:9090

### Grafana (from kube-prometheus-stack)
```bash
kubectl port-forward svc/kube-prometheus-stack-grafana -n monitoring 3000:80
```
Access at: http://localhost:3000

Default credentials:
- Username: `admin`
- Password: `prom-operator`

### Alertmanager
```bash
kubectl port-forward svc/kube-prometheus-stack-alertmanager -n monitoring 9093:9093
```
Access at: http://localhost:9093

### Loki
```bash
kubectl port-forward svc/loki -n monitoring 3100:3100
```
Access at: http://localhost:3100

## Configuration

Chart values are stored in `charts/` directory:
- `charts/prometheus/value.yaml` - kube-prometheus-stack configuration
- `charts/loki/value.yaml` - Loki configuration
- `charts/promtail/value.yaml` - Promtail configuration
- `charts/grafana/value.yaml` - Standalone Grafana configuration

## Fetching Default Values

Use the helper script to fetch default Helm values:

```bash
cd scripts
./get-helm-values.sh
```

Edit the script to change chart name, version, and output file.

## Outputs

The following outputs are available after deployment:
- Service names
- Namespaces
- Port-forward commands
- Admin password retrieval commands
