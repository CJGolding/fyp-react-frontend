SHELL := /bin/bash
folder_name = fyp-react-frontend
docker_image_name = $(folder_name)
docker_container_name = $(folder_name)-container

.PHONY: requirements
requirements:
	npm install

.PHONY: run
run:
	npm run dev

.PHONY: docker-clean
docker-clean:
	-docker stop $(docker_container_name) 2>/dev/null || true
	-docker rm $(docker_container_name) 2>/dev/null || true
	-docker rmi $(docker_image_name) 2>/dev/null || true

.PHONY: docker-build
docker-build:
	docker build -t $(docker_image_name) .

.PHONY: docker-run
docker-run: docker-clean docker-build
	docker run -d -p 5173:5173 --name $(docker_container_name) $(docker_image_name)
	@echo "Docker container '$(docker_container_name)' is running on http://localhost:5173"
	@echo "View logs with: docker logs -f $(docker_container_name)"
	@echo "Stop with: docker stop $(docker_container_name)"

