# Cinemates — DevOps Phases

Full-stack app (React + Node.js + MongoDB) → production on GCP using free-tier tooling where possible.
Every infra decision is declarative. Every deployment is automated. No clicking in consoles.

**Stack:** GCP · GKE · Terraform · GitHub Actions · Docker Hub · ArgoCD · Helm · Envoy Gateway · MongoDB Atlas

---

## Phase 0 — Foundation & Account Setup

Get everything in place before writing a single line of infrastructure.

**Tasks**
- Create a dedicated GCP project. Set a billing alert at $20 immediately. Enable APIs: `container`, `compute`, `iam`, `dns`, `secretmanager`, `cloudresourcemanager`
- Create a `terraform-deployer` Service Account with least-privilege roles. Export the key and store it as a GitHub Actions secret. Never use a personal account for automation
- Create the GitHub monorepo. Apply branch protection on `main` and `develop` — no direct pushes, PRs required, CI must pass before merge
- Store all secrets in GitHub Actions Secrets: GCP SA key, Docker Hub access token, MongoDB Atlas URI, SonarCloud token. Nothing hardcoded, no `.env` files committed
- Create a MongoDB Atlas free M0 cluster. Note the connection string. Whitelist `0.0.0.0/0` for now — you'll tighten this to the GKE NAT IP in Phase 1

**Done when:** A teammate clones the repo and finds zero credentials anywhere. Branch protection is active. Billing alert is set.

---

## Phase 1 — Core GCP Infrastructure via Terraform

Provision every GCP resource as code. If it isn't in Terraform, it doesn't exist.

**Tasks**
- Manually create a GCS bucket for Terraform remote state first — this must exist before any Terraform runs. GCS handles state locking natively, no extra tooling needed
- Write a custom VPC with subnets per zone and secondary IP ranges for GKE pods and services. Never use the default VPC
- Set up Cloud NAT so private GKE nodes can reach Docker Hub and MongoDB Atlas outbound
- Provision a GKE Standard cluster — zonal (free control plane), e2-small Spot nodes, Cluster Autoscaler enabled with 1–3 node range
- Configure IAM + Workload Identity Federation so pods can assume GCP Service Account roles via annotations. No SA key files inside containers, ever
- Create a Cloud DNS managed zone. Terraform will manage the A record pointing to the Gateway load balancer IP (wired up in Phase 5)
- Add a GitHub Actions workflow that runs `terraform plan` on any PR touching `infra/` and posts the plan as a PR comment

**Done when:** `kubectl get nodes` returns healthy nodes. Every GCP resource was created by Terraform. A `terraform destroy` followed by `terraform apply` reproduces the full environment cleanly.

---

## Phase 2 — Containerize the App

Both services run identically in Docker locally and on the cluster. No environment-specific surprises.

**Tasks**
- Write a multi-stage Dockerfile for the frontend: Node builder stage, then nginx to serve static files. Final image under 60MB, no node_modules in the production stage
- Write a multi-stage Dockerfile for the backend: compile/bundle in one stage, run as a non-root user in the final stage. Never run as root
- Add `/health/live` and `/health/ready` endpoints to the backend. Readiness must verify the MongoDB connection — GKE uses these probes to decide if a pod is ready for traffic
- All config via environment variables only. `MONGO_URI`, `PORT`, `NODE_ENV` come from the environment, never from committed files
- Wire frontend, backend, and a local MongoDB container together in `docker-compose.yml` so the full stack runs with a single command locally

**Done when:** Both images build cleanly. `docker compose up` starts the full stack. `/health/ready` returns 200 when Mongo is connected and a proper error code when it isn't.

---

## Phase 3 — CI Pipeline via GitHub Actions

A push to `develop` should automatically test, scan, build, and publish — without anyone touching a keyboard.

**Tasks**
- Run unit tests for both frontend and backend as the first step. Pipeline stops here if anything fails — no exceptions, no skip flags
- Run a SonarCloud scan (free for public repos). Gate on coverage threshold and critical severity issues
- After building Docker images, run a Trivy vulnerability scan. Fail the pipeline on any CRITICAL findings before anything gets pushed to Docker Hub
- Build both images tagged with the Git commit SHA. Push to Docker Hub only after all tests and scans pass
- After a successful push, commit the new image tag into `helm/cinemates/values-staging.yaml` — this is the signal ArgoCD watches. Loop: CI commits → ArgoCD detects → cluster updates
- On merge to `main`, the same pipeline runs with a manual approval gate before updating `values-prod.yaml`

**Done when:** Push to `develop`. Without any manual step, a new versioned image appears on Docker Hub and the image tag in `values-staging.yaml` is updated in a new Git commit.

---

## Phase 4 — GitOps Deployment via ArgoCD + Helm

From this phase forward, nobody runs `kubectl apply` manually. Every cluster change flows through Git.

**Tasks**
- Deploy ArgoCD to the `argocd` namespace. Change the default admin password immediately. Start with port-forward for UI access — don't expose it publicly yet
- Set up the App of Apps pattern: one root ArgoCD Application manages all other Applications. Adding a new service = one YAML file, not a CLI command
- Write the Cinemates Helm chart with templates for Deployment, Service, HPA, and PDB. Use separate values files per environment. ArgoCD points each Application at the right values file
- Enable automated sync with `selfHeal` and `prune` on all Applications. Manual cluster changes get reverted — this is intentional
- Manage all supporting tools (cert-manager, KEDA, Envoy Gateway, monitoring stack) as ArgoCD Applications pointing at official Helm charts. The whole cluster is GitOps-managed
- Wire up ArgoCD notifications for sync failures and degraded health — a broken deploy nobody knows about is the worst outcome

**Done when:** All Applications show Synced + Healthy. A code push to `develop` deploys to staging in under 3 minutes. Manually deleting a pod triggers ArgoCD to recreate it. Rollback = `git revert`.

---

## Phase 5 — Gateway API + TLS

The app is publicly reachable over HTTPS at a real domain. No Ingress resources anywhere.

**Tasks**
- Deploy Envoy Gateway via ArgoCD. Create a `GatewayClass` resource that declares Envoy as the implementation for this cluster
- Create a `Gateway` resource with two listeners: port 80 (HTTP → HTTPS redirect) and port 443 (TLS termination). GKE auto-provisions a Cloud Load Balancer for it
- Write `HTTPRoute` rules: `/api/*` goes to the backend service, `/*` goes to the frontend. This is the entire routing configuration — no nginx.conf, no Ingress annotations
- Deploy cert-manager via ArgoCD. Create a `ClusterIssuer` pointing at Let's Encrypt ACME. Attach a `Certificate` to the Gateway listener. Renewal is fully automatic
- Update Terraform to create a Cloud DNS A record pointing your domain at the load balancer IP provisioned by the Gateway
- Use separate Gateways per namespace: `staging.cinemates.yourdomain.com` for staging, `cinemates.yourdomain.com` for prod

**Done when:** `https://staging.cinemates.yourdomain.com` loads the app with a valid Let's Encrypt cert. HTTP redirects to HTTPS. No browser warnings. Frontend loads, API responds.

---

## Phase 6 — Autoscaling via KEDA + GKE Cluster Autoscaler

The system scales in response to real demand. Nobody changes replica counts by hand.

**Tasks**
- Deploy KEDA via ArgoCD into the `keda` namespace. KEDA extends the default HPA to support event-driven and metric-driven scaling triggers
- Create a `ScaledObject` for the backend: scale on incoming request rate sourced from Prometheus. Set `minReplicaCount: 1`, `maxReplicaCount: 5`. Define the per-replica threshold based on your load test results
- Create a `ScaledObject` for the frontend: scale on CPU utilization. Simpler trigger is fine since the frontend is stateless
- Verify GKE Cluster Autoscaler (configured in Phase 1) is working: when pods are unschedulable due to resource pressure, new nodes should provision within 90 seconds
- Run a load test using k6. Observe pods scaling up and, if needed, new nodes provisioning. Document the test script and results in the repo
- Audit every Deployment for CPU and memory requests before calling this phase complete — autoscaling decisions are meaningless without accurate requests

**Done when:** Load test runs. New pods schedule and new nodes provision in real time. When load drops, scale-down completes within the cooldown window. No manual intervention at any point.

---

## Phase 7 — Observability: Metrics, Logs & Traces

Answer any question about system health without SSH-ing into a pod.

**Tasks**
- Deploy `kube-prometheus-stack` via ArgoCD into the `monitoring` namespace. This single Helm chart covers Prometheus, Alertmanager, Grafana, node-exporter, and kube-state-metrics
- Deploy Loki + Promtail via ArgoCD. Promtail runs as a DaemonSet and ships logs from every node to Loki. Logs are queryable directly from Grafana's Explore tab
- Deploy Tempo as the distributed tracing backend. Configure it as a Grafana datasource so you can navigate from a log line to the trace that generated it
- Deploy the OpenTelemetry Collector as a DaemonSet. The backend sends traces to the collector, which forwards to Tempo. Single pipeline for all telemetry signals
- Instrument the Node.js backend with the OTel SDK. Auto-instrumentation for HTTP and MongoDB is sufficient to start — this is a one-file addition, not a refactor
- Import standard Kubernetes cluster dashboards into Grafana. Build custom panels for request rate, error rate, and p99 latency. Set alerting rules for error rate > 1% and pod crash-loop events

**Done when:** Open Grafana and answer these without touching a terminal — What is p99 latency right now? How many 5xx errors in the last hour? Which pod logged an error at a specific timestamp?

---

## Phase 8 — Production Hardening

The gap between a working demo and a system you'd put real users on.

**Tasks**
- Define `PodDisruptionBudgets` for frontend and backend ensuring at least one replica of each survives any node drain or GKE maintenance window
- Apply a default-deny `NetworkPolicy` to the prod namespace. Explicitly allow only: Gateway → Frontend, Gateway → Backend, Backend → outbound (MongoDB). Nothing else gets through
- Apply `ResourceQuota` to the prod namespace to prevent a misconfigured rollout from consuming all cluster resources
- Deploy External Secrets Operator and configure it to sync secrets from GCP Secret Manager into Kubernetes Secrets. Nothing sensitive in Git. ESO handles rotation automatically
- Set security context on all containers: `runAsNonRoot: true`, `readOnlyRootFilesystem: true` where possible, `allowPrivilegeEscalation: false`
- Verify MongoDB Atlas backup schedule. Run a point-in-time restore test. Document the recovery steps
- Write a runbook: how to roll back a deployment, drain a node, check cluster health, restore MongoDB. This is what gets read at 2am

**Done when:** `kubectl drain` a node while traffic flows — app stays up. Revert a Git commit to roll back — cluster updates without any manual step. Both work on the first try.

---

## Across All Phases

- Every GCP resource is Terraform-managed. Nothing exists that isn't in code
- Every cluster change goes through Git → ArgoCD. No exceptions
- No Ingress objects anywhere. Gateway API + HTTPRoute is the only routing layer
- No Kustomize. App workloads live in Helm. Supporting tools deploy via ArgoCD pointing at official charts
- Secrets never touch Git. GitHub Actions Secrets for CI, GCP Secret Manager + ESO for the cluster