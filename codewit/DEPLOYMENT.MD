# 🚀 Deployment Guide

This document describes how to use the provided `Makefile` to build Docker images, push them to the DigitalOcean Container Registry, and deploy them to a Kubernetes cluster.

---

## Prerequisites

Make sure the following tools are installed:
- Docker
- doctl
- kubectl
- Kompose
- DigitalOcean personal access token with read and write access to the kubernetes cluster and container registry.

---

## ⚙️ Configuration

1. The `Makefile` defines several configurable variables:

    | Variable          | Description                                                        |
    |-------------------|--------------------------------------------------------------------|
    | `DOCKER_REGISTRY` | Docker registry path (DigitalOcean Container Registry)             |
    | `K8S_DIR`         | Directory where Kubernetes manifests are stored/generated (default: `./k8s`) |
    | `TAG`             | Docker image tag (default: `latest`)                               |
    | `CLUSTER_NAME`    | Name of the DigitalOcean Kubernetes cluster (default: `codewit-us`) |
    | `KUBE_CONTEXT`    | Local kubeconfig context name (default: `codewitus`) |
    | `DO_TOKEN`        | DigitalOcean API token (used for `doctl` auth)                     |
    | `BUILD_SERVICES`  | List of services to build and deploy (`app`, `frontend`, `codeeval`) |

2. Make Sure the `api/src/models/index.tsx` has the code to connect to the database with SSL
    ```typescript
    dialectOptions: {
        ssl: {
        require: true,
        rejectUnauthorized: false, // Set to true if you have a valid CA certificate
        },
    },
    ```

3. If there are changes to the `docker-compose-deploy.yml` file, run `make ksync` to generate the Kubernetes manifests.
4. Post that add the below YAML to `frontend-ingress.yaml` under metadata.annotations
    ```yaml
        nginx.ingress.kubernetes.io/server-snippet: |-
            location ~* "^/api(/|$)(.*)" {
                set $url http://SERVICE_NAME.NAMESPACE.svc.cluster.local:PORT/$2$is_args$args;
                proxy_pass $url;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }

            location ~* "^/codeeval(/|$)(.*)" {
                set $url http://SERVICE_NAME.NAMESPACE.svc.cluster.local:PORT/$2$is_args$args;
                proxy_pass $url;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header Cookie $http_cookie;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }
    ```

5. Flow of the commands:
    ```bash
    make auth
    make registry-login
    make build
    make push
    make kube-login
    make deploy
    ```

> **Note:** Currently (as of 2025-07-14), the `make ksync` command is not needed to be run.

## 🛠️ Makefile Targets

### `make all`

Performs a full cycle:
- Builds Docker images
- Pushes them to the registry
- Deploys to Kubernetes

```bash
make all
```
---

### `make build`
Builds Docker images for each service:
- Backend (app) from Dockerfile.backend
- Frontend from Dockerfile.frontend
- Codeeval from ../../codeval/Dockerfile

```bash
make build
```

---

### `make push`
Pushes all built Docker images to the configured registry.

```bash
make push
```

---

### `make deploy`
Deploys the Kubernetes manifests from the k8s directory to the cluster.

```bash
make deploy
```

---

### `make ksync`

Generates Kubernetes manifests using Kompose from docker-compose-deploy.yml into the ./k8s directory.

```bash
make ksync
```

---

### `make auth`

Initializes DigitalOcean CLI authentication using the DO_TOKEN.

```bash
make auth
```

---

### `make kube-login`

Fetches and configures kubeconfig for the DigitalOcean Kubernetes cluster:
1. Fetches the kubeconfig for CLUSTER_NAME
2. Renames the context to KUBE_CONTEXT
3. Switches to that context

```bash
make kube-login
```

---

### `make registry-login`

Logs into the DigitalOcean Container Registry using doctl.

```bash
make registry-login
```

---

### `make clean`

Removes all locally built Docker images for the services defined in BUILD_SERVICES.

```bash
make clean
```