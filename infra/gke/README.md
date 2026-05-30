# GKE Cluster Module

This Terraform module provisions a Google Kubernetes Engine (GKE) cluster with custom node pools.

## Resources Provisioned

- **GKE Cluster**: Standard GKE cluster with VPC-native networking
- **Node Pool**: Custom managed node pool with preemptible instances
- **Labels**: Production-grade labeling for cost tracking and resource management

## Features

- VPC-native cluster using secondary IP ranges for pods and services
- Custom Kubernetes version (configurable)
- Preemptible nodes for cost optimization
- Automatic labeling with environment, project, and custom tags
- Remote state integration with VPC module

## Prerequisites

The VPC module must be applied first, as this module reads VPC network and subnet information from remote state.

## Usage
``` bash

# Create Workspace
terraform workspace new <workspace-name>

# Select Workspace
terraform workspace select <workspace-name>

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan changes
terraform plan -var-file=../cinemates.tfvars

# Apply changes
terraform apply -var-file=../cinemates.tfvars
```