.PHONY: clean build-prod build-uat build-dev

clean: ## Stop and remove containers and remove specific Docker images for the selected environment.
ifeq ($(ENV), prod)
	-docker container stop node-back-end-production
	-docker container rm node-back-end-production
	-docker image rm node-back-end-production
else ifeq ($(ENV), uat)
	-docker container stop node-back-end-uat
	-docker container rm node-back-end-uat
	-docker image rm node-back-end-uat
else ifeq ($(ENV), dev)
	-docker container stop node-back-end-dev
	-docker container rm node-back-end-dev
	-docker image rm node-back-end-dev
else
	@echo "Invalid environment. Use 'ENV=prod', 'ENV=uat', or 'ENV=dev'."
endif

build-prod: ## Build the production docker image.
	docker compose -f docker/production/docker-compose.yml build

build-uat: ## Build the UAT docker image.
	docker compose -f docker/uat/docker-compose.yml build

build-dev: ## Build the development docker image.
	docker compose -f docker/dev/docker-compose.yml build


.PHONY: run-prod run-uat run-dev

run-prod:
	$(MAKE) clean ENV=prod
	$(MAKE) build-prod
	docker compose -f docker/production/docker-compose.yml up -d

run-uat: 
	$(MAKE) clean ENV=uat
	$(MAKE) build-uat
	docker compose -f docker/uat/docker-compose.yml up -d

run-dev: 
	$(MAKE) clean ENV=dev
	$(MAKE) build-dev
	docker compose -f docker/dev/docker-compose.yml up -d

