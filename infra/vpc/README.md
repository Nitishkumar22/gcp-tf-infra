# 🏗️ GKE Core Infrastructure

This directory contains the Terraform modules to provision the foundational network and compute resources on GCP.

## Resources Provisioned
*   **VPC & Subnets**: A custom VPC network and subnetwork tailored for GKE.
*   **GKE Cluster**: A VPC-native Google Kubernetes Engine cluster.
    *   **Gateway API Enabled**: The cluster is configured to support the GKE Gateway Controller for advanced traffic management.
*   **Node Pools**: Custom managed node pools for running the application workloads.

## Usage
```bash
terraform init
terraform plan
terraform apply
```
