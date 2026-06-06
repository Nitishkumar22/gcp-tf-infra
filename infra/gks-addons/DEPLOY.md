# ArgoCD Deployment Guide

## Quick Start

Follow these steps to deploy ArgoCD to your GKE cluster.

### Step 1: Configure kubectl

```bash
gcloud container clusters get-credentials cinemates-cluster --zone=us-east1-b --project=cinemates-497209
```

### Step 2: Navigate to the directory

```bash
cd infra/gks-addons
```

### Step 3: Initialize Terraform

```bash
terraform init
```

### Step 4: Select or create workspace

```bash
terraform workspace select dev
# or if it doesn't exist
terraform workspace new dev
```

### Step 5: Plan the deployment

```bash
terraform plan -var-file=tfvars/dev.tfvars
```

### Step 6: Apply the configuration

```bash
terraform apply -var-file=tfvars/dev.tfvars
```