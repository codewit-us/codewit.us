# === CONFIG ===
DOCKER_REGISTRY=registry.digitalocean.com/codewitus
K8S_DIR=./k8s
TAG=latest
CLUSTER_NAME=DIGITALOCEAN_CLUSTER_NAME
BUILD_SERVICES=app frontend codeeval
DO_TOKEN=DIGITALOCEAN_ACCESS_TOKEN
KUBE_CONTEXT=codewit

# === TARGETS ===

.PHONY: all kube-login auth dashboard

## Show token and start port-forward for Kubernetes Dashboard
dashboard: kube-login
	@echo "===================================="
	@echo "Fetching login token for admin-user..."
	@kubectl -n kubernetes-dashboard create token admin-user
	@echo "===================================="
	@echo "Access the dashboard at: https://localhost:8443/"
	@echo "Use the above token when prompted."
	@echo "===================================="
	kubectl -n kubernetes-dashboard port-forward svc/kubernetes-dashboard-kong-proxy 8443:443

## Log in to Kubernetes cluster
kube-login: auth
	@echo "🔐 Fetching kubeconfig for cluster $(CLUSTER_NAME)..."
	doctl kubernetes cluster kubeconfig save $(CLUSTER_NAME)

	@echo "🔍 Detecting newly added context..."
	LATEST_CONTEXT=$$(kubectl config get-contexts -o name | grep $(CLUSTER_NAME) | tail -n1); \
	if [ "$$(kubectl config get-contexts -o name | grep -x $(KUBE_CONTEXT))" ]; then \
		echo "⚠️  Deleting existing context '$(KUBE_CONTEXT)' to allow renaming..."; \
		kubectl config delete-context $(KUBE_CONTEXT); \
	fi; \
	echo "Renaming context '$$LATEST_CONTEXT' to '$(KUBE_CONTEXT)'..."; \
	kubectl config rename-context $$LATEST_CONTEXT $(KUBE_CONTEXT)

	@echo "✅ Switching to context '$(KUBE_CONTEXT)'"
	kubectl config use-context $(KUBE_CONTEXT)

## Initialize DigitalOcean auth if needed
auth:
	@echo "🌐 Authenticating doctl with DigitalOcean..."
	doctl auth init --access-token $(DO_TOKEN) --context codewit
	doctl auth switch --context codewit