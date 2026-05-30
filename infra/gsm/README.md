# Secret Manager Module

This module creates Google Secret Manager secrets for storing sensitive data.

## What it creates

- Secret Manager secret with multi-region replication
- Labels for organization

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
```

## Add secret value

After creating the secret, add a version with actual data:

```bash
# Add secret value
echo -n "my-secret-value" | gcloud secrets versions add dev-secret --data-file=-

# Or from file
gcloud secrets versions add dev-secret --data-file=secret.txt
```

## Access secret in code

```bash
# Get latest secret value
gcloud secrets versions access latest --secret=dev-secret
```
