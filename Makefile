DOCKER_USERNAME=apallotta99
IMAGE_NAME=api-image
VERSION_FILE=./VERSION
VERSION := $(shell cat $(VERSION_FILE))
EC2_SEC_GROUP=sg-0836e9459cd67ff11
BLACKLIST_FILE=./formatted_blacklisted_ips.json

.PHONY: up down restart test bump build push blacklist-ips

up:
	docker-compose up --build -d $(filter-out $@,$(MAKECMDGOALS))
down:
	docker-compose down $(filter-out $@,$(MAKECMDGOALS))
restart:
	services=$$(docker-compose ps -q); \
	docker-compose down $$services; \
	docker-compose up -d --build $$services
test:
	docker-compose -f docker-compose.test.yml up --build -d $(filter-out $@,$(MAKECMDGOALS))
bump:
ifeq ($(filter $(part), major minor patch),)
	$(error part is invalid. Please specify the version bump as follows: make bump v=<major|minor|patch>)
endif

	$(eval VERSION_PART := $(shell echo $(part) | tr a-z A-Z))
	$(eval MAJOR := $(shell awk -F . '{print $$1}' $(VERSION_FILE)))
	$(eval MINOR := $(shell awk -F . '{print $$2}' $(VERSION_FILE)))
	$(eval PATCH := $(shell awk -F . '{print $$3}' $(VERSION_FILE)))

ifeq ($(part),major)
	@echo "Bumping $(VERSION_PART) version from $(VERSION) to $$(expr $(MAJOR) + 1).0.0"
	@echo $$(expr $(MAJOR) + 1).0.0 > $(VERSION_FILE)
else ifeq ($(part),minor)
	@echo "Bumping $(VERSION_PART) version from $(VERSION) to $(MAJOR).$$(expr $(MINOR) + 1).0"
	@echo $(MAJOR).$$(expr $(MINOR) + 1).0 > $(VERSION_FILE)
else
	@echo "Bumping $(VERSION_PART) version from $(VERSION) to $(MAJOR).$(MINOR).$$(expr $(PATCH) + 1)"
	@echo $(MAJOR).$(MINOR).$$(expr $(PATCH) + 1) > $(VERSION_FILE)
endif
	@echo "$(part) version bump completed"
set-version:
ifndef v
	$(error v is undefined. Please specify the new version number as follows: make set-version v=<version>)
endif
	@echo $(v) > $(VERSION_FILE)
	@echo "Version updated to $(v)"
build:
	$(eval tag := $(shell cat VERSION))
	docker build -t $(DOCKER_USERNAME)/$(IMAGE_NAME):$(tag) -f ./backend/Dockerfile.prod ./backend
push:
	$(eval tag := $(shell cat VERSION))
	docker push $(DOCKER_USERNAME)/$(IMAGE_NAME):$(tag)
blacklist-ips:
	if test -f "$(BLACKLIST_FILE)"; then \
		aws ec2 authorize-security-group-ingress \
		--group-id $(or $(GROUP_ID),$(EC2_SEC_GROUP)) \
		--ip-permissions file://$(BLACKLIST_FILE); \
	else \
		echo "File not found: $(FILE)"; \
	fi
