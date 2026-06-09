# PostgreSQL Helm Chart

This directory contains the values file for deploying PostgreSQL using the official Docker image.

## Configuration

The `value.yaml` file contains the configuration for PostgreSQL deployment.

### Key Configuration Options

- **Image**: Uses official PostgreSQL Docker image (`postgres:16-alpine`)
- **Authentication**: Configure passwords and users via `auth` section
- **Persistence**: 20Gi storage by default
- **Resources**: CPU and memory limits configured for production use

### Required Values

Before deploying, set the following in `value.yaml`:

- `auth.postgresPassword`: Password for the postgres superuser
- `auth.username`: Application database username (optional)
- `auth.password`: Application database password (optional)
- `auth.database`: Application database name (optional)
- `primary.persistence.storageClass`: Storage class for your GKE cluster

## Deployment

This chart is deployed via Terraform using the configuration in `postgress.tf`.
