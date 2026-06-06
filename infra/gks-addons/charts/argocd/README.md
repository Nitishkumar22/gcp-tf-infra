# ArgoCD

This directory contains the Helm chart configuration for deploying ArgoCD.

## Files

1. `values.yaml`: Defines the configuration for the ArgoCD Helm chart.
2. `argocd.tf`: Uses `values.yaml` to deploy ArgoCD to the GKE cluster via Terraform.
3. `get-helm-values.sh`: Script to generate or update the `values.yaml` file.

## Usage

### Retrieve ArgoCD Admin Password

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d
```

- **Username:** `admin`

### Access ArgoCD UI (Port Forward)

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then visit [https://localhost:8080](https://localhost:8080) in your browser.