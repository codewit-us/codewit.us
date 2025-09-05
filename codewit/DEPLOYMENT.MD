# 🚀 Deployment Guide

This document describes how to use the provided `Makefile` to access the kubernetes dashboard and every push to the main branch will trigger the CI/CD pipeline to build and deploy the services to a Kubernetes cluster.

---

## Prerequisites

Make sure the following tools are installed:
- doctl
- kubectl
- DigitalOcean personal access token with read and write access to the kubernetes cluster and container registry.

---

## ⚙️ Configuration

1. The `Makefile` defines several configurable variables:

    | Variable          | Description                                                        |
    |-------------------|--------------------------------------------------------------------|
    | `DOCKER_REGISTRY` | Docker registry path (DigitalOcean Container Registry)             |
    | `K8S_DIR`         | Directory where Kubernetes manifests are stored/generated (default: `./k8s`) |
    | `TAG`             | Docker image tag (default: `latest`)                               |
    | `CLUSTER_NAME`    | Name of the DigitalOcean Kubernetes cluster **(REQUIRED)** |
    | `KUBE_CONTEXT`    | Local kubeconfig context name (default: `codewitus`) |
    | `DO_TOKEN`        | DigitalOcean API token (used for `doctl` auth) **(REQUIRED)** |
    | `BUILD_SERVICES`  | List of services to build and deploy (`app`, `frontend`, `codeeval`) |

2. Merge your PR to `main` branch and it will trigger the CI/CD pipeline to build and deploy the services.
6. To access kubernetes dashboard, run the following command:
    ```bash
    make dashboard
    ```

## 🛠️ Makefile Targets

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

### `make dashboard`

Starts port-forwarding for the Kubernetes Dashboard and prints the login token.

```bash
make dashboard
```