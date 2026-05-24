# ⛵ Cinemates Helm Charts

This directory contains the Helm charts used to package, configure, and deploy the **Cinemates** full-stack application to Kubernetes. Helm makes deployments repeatable, customizable via template values, and easy to roll back.

---

## 📁 Repository Overview

We recommend structuring the charts within this folder as follows:

```text
helm-charts/
├── cinemates-backend/     # Helm chart for the Express API & WebSocket Server
├── cinemates-frontend/    # Helm chart for the React SPA (Vite)
└── values-production.yaml # Environment-specific values overrides
```

### Typical Chart Structure
Each individual chart directory (e.g., `cinemates-backend/`) follows the standard Helm structure:
```text
chart-name/
├── Chart.yaml          # Metadata about the chart (version, name, appVersion)
├── values.yaml         # Default configuration values
├── templates/          # Kubernetes resource templates
│   ├── deployment.yaml # Deployment specs (replicas, containers, ports)
│   ├── service.yaml    # Service specs (ClusterIP, NodePort, LoadBalancer)
│   ├── ingress.yaml    # Ingress rules to route HTTP traffic
│   ├── configmap.yaml  # Environment configuration
│   ├── secrets.yaml    # Base64 encoded sensitive configs (or external secrets)
│   └── _helpers.tpl    # Reusable template snippets
```

---

## ⚙️ Configuration & Environment Variables

The Cinemates application requires several environment variables to function correctly. These should be configured in each chart's `values.yaml` or provided during deployment:

### Backend Chart Configs (`cinemates-backend/values.yaml`)
| Parameter | Description | Default / Example |
|-----------|-------------|-------------------|
| `replicaCount` | Number of running backend pods | `2` |
| `env.PORT` | Express server port | `3000` |
| `env.MONGO_URI` | MongoDB connection connection string | `mongodb+srv://...` |
| `env.CLOUDINARY_CLOUD_NAME` | Cloudinary Name | `your-cloud-name` |
| `env.CLOUDINARY_API_KEY` | Cloudinary API Key | `your-api-key` |
| `env.CLOUDINARY_API_SECRET` | Cloudinary Secret Key | `your-api-secret` |
| `env.NODE_ENV` | Mode of execution | `production` |
| `ingress.enabled` | Whether to create an Ingress resource | `true` |
| `ingress.hosts[0].host` | Backend API hostname | `api.cinemates.com` |

### Frontend Chart Configs (`cinemates-frontend/values.yaml`)
| Parameter | Description | Default / Example |
|-----------|-------------|-------------------|
| `replicaCount` | Number of running frontend web servers | `2` |
| `ingress.enabled` | Expose frontend via ALB / Ingress Controller | `true` |
| `ingress.hosts[0].host` | Frontend application hostname | `cinemates.com` |

---

## 🚀 Deployment Commands

Before running any Helm commands, ensure your Kubernetes context is set correctly:
```bash
kubectl config current-context
```

### 1. Lint the Chart
Always validate the syntax and structure of your Helm charts before deploying:
```bash
helm lint ./helm-charts/cinemates-backend
helm lint ./helm-charts/cinemates-frontend
```

### 2. Install / Upgrade the Charts
Use `helm upgrade --install` to perform safe, idempotent installations or upgrades. 

**Backend Deployment:**
```bash
helm upgrade --install cinemates-backend ./helm-charts/cinemates-backend \
  --namespace cinemates --create-namespace \
  --values ./helm-charts/values-production.yaml \
  --set env.MONGO_URI="mongodb+srv://..."
```

**Frontend Deployment:**
```bash
helm upgrade --install cinemates-frontend ./helm-charts/cinemates-frontend \
  --namespace cinemates \
  --values ./helm-charts/values-production.yaml
```

### 3. Verify Rollouts
Ensure your pods are spinning up successfully:
```bash
kubectl get pods -n cinemates
kubectl get ingress -n cinemates
```

### 4. Rollback a Deployment
If an issue is found after deployment, roll back to the previous release index immediately:
```bash
# View deployment history
helm history cinemates-backend --namespace cinemates

# Rollback to revision 1
helm rollback cinemates-backend 1 --namespace cinemates
```

---

## 🌐 Traffic Routing (Gateway API)

The charts are designed to leverage the modern **Kubernetes Gateway API** instead of traditional Ingress controllers. The core `Gateway` resources are managed by the infrastructure (`infra/gks-addons`), while the application-specific routing rules (e.g., `HTTPRoute`) should be defined in these charts.

```yaml
# Example HTTPRoute in templates/httproute.yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: HTTPRoute
metadata:
  name: cinemates-backend-route
spec:
  parentRefs:
  - name: cinemates-gateway # The central Gateway managed in infra
  rules:
  - matches:
    - path:
        type: PathPrefix
        value: /api
    backendRefs:
    - name: cinemates-backend
      port: 3000
```
Using the Gateway API, the native GCP Load Balancer will efficiently route traffic to the appropriate backend or frontend services.
