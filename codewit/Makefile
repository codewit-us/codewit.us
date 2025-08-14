# === CONFIG ===
DOCKER_REGISTRY=registry.digitalocean.com/codewitus
K8S_DIR=./k8s
TAG=latest
CLUSTER_NAME=codewit-us
BUILD_SERVICES=app frontend codeeval
DO_TOKEN=DIGITALOCEAN_TOKEN
KUBE_CONTEXT=codewitus

# === TARGETS ===

.PHONY: all build push deploy clean ksync kube-login registry-login auth

all: build push deploy

## Docker build
build:
	@for service in $(BUILD_SERVICES); do \
	  if [ $$service = "app" ]; then \
	    echo "🔨 Building backend..."; \
	    docker build --build-arg MODE=prod --platform linux/amd64 -t $(DOCKER_REGISTRY)/app:$(TAG) -f Dockerfile.backend . ; \
	  elif [ $$service = "frontend" ]; then \
	    echo "🔨 Building frontend..."; \
	    docker build --build-arg MODE=prod --platform linux/amd64 -t $(DOCKER_REGISTRY)/frontend:$(TAG) -f Dockerfile.frontend . ; \
	  elif [ $$service = "codeeval" ]; then \
	    echo "🔨 Building codeeval..."; \
	    docker build --build-arg MODE=prod --platform linux/amd64 -t $(DOCKER_REGISTRY)/codeeval:$(TAG) -f ../../codeval/Dockerfile ../../codeval/ ; \
	  fi \
	done

## Push Docker images
push: auth registry-login
	@for service in $(BUILD_SERVICES); do \
	  echo "📤 Pushing $$service..."; \
	  docker push $(DOCKER_REGISTRY)/$$service:$(TAG) ; \
	done

## Apply Kubernetes manifests
deploy: kube-login
	@echo "🚀 Deploying to Kubernetes..."
	kubectl apply -f $(K8S_DIR)

## Clean local images
clean:
	@for service in $(BUILD_SERVICES); do \
	  echo "🧹 Removing $$service..."; \
	  docker rmi $(DOCKER_REGISTRY)/$$service:$(TAG) || true ; \
	done

## (Re)generate Kubernetes manifests
ksync:
	@echo "🔁 Re-generating Kubernetes manifests from docker-compose-deploy.yml..."
	rm -rf $(K8S_DIR)
	mkdir -p $(K8S_DIR)
	kompose convert -f docker-compose-deploy.yml -o $(K8S_DIR)

## Log in to DigitalOcean registry
registry-login:
	@echo "🔐 Logging into DigitalOcean Container Registry..."
	doctl registry login

## Log in to Kubernetes cluster
kube-login:
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
	doctl auth init --access-token $(DO_TOKEN) --context codewitus
	doctl auth switch --context codewitus