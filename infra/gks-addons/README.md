# 🧩 GKE Add-ons

This directory contains the Terraform configuration for deploying necessary Kubernetes add-ons and configurations to the GKE cluster provisioned in `../gks`.

## Resources Provisioned
*   **Gateway API Configurations**: Setup of `GatewayClasses` and base `Gateway` resources to expose the Cinemates frontend and backend to the internet.
*   *(Optional)* External Secrets Operator, Cert-Manager, or other cluster-wide utilities.

## Note on Gateway API
Instead of using standard `Ingress` resources, this project uses the Kubernetes Gateway API. This provides a more expressive, extensible, and role-oriented model for managing network routing into the cluster.

## Usage
Ensure the `gks` infrastructure is applied and your `kubectl` is authenticated to the cluster before applying these add-ons.
```bash
terraform init
terraform plan
terraform apply
```
