# Artifact Registry Module

This module creates Google Artifact Registry repositories for storing Docker images.

## What it creates

- Docker image repositories (backend, frontend, etc.)
- Labels for cost tracking and organization

## Usage

```bash
# Create workspace
terraform workspace new dev

# Select workspace
terraform workspace select dev

# Initialize
terraform init

# Plan
terraform plan -var-file=tfvars/dev.tfvars

# Apply
terraform apply -var-file=tfvars/dev.tfvars
