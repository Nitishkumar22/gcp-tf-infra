# ☁️ Cinemates Infrastructure (GCP)

This directory contains the Terraform configuration required to provision the infrastructure for the Cinemates application on Google Cloud Platform (GCP).

## Directory Structure

*   **`gks/`**: Contains the core infrastructure setup. This includes the VPC, Subnets, and the Google Kubernetes Engine (GKE) cluster.
*   **`gks-addons/`**: Contains the Terraform configuration for any Kubernetes-level add-ons and services required by the cluster, such as Gateway API configurations, external secrets, or observability tools.

## Prerequisites
*   Terraform installed locally
*   `gcloud` CLI installed and authenticated
*   A GCP Project with billing enabled

## Note on Traffic Routing
The Cinemates infrastructure uses the modern **Kubernetes Gateway API** for traffic routing instead of traditional Ingress controllers. This is configured natively via GKE's Gateway controller.
