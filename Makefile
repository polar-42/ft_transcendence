all:
	@mkdir -p ~/data/blockchain
	@echo Docker is launching...
	@docker compose -f srcs/docker-compose.yml up --build
	@echo Docker is launch in detach mode

detach:
	@mkdir -p ~/data/blockchain
	@echo Docker is launching...
	@docker compose -f srcs/docker-compose.yml up --build -d

restart:
	@mkdir -p ~/data/blockchain
	@echo Docker is launching...
	@docker compose -f srcs/docker-compose.yml up -d
	@echo Docker is launch in detach mode

status:
	@docker ps

info:
	@docker image ls; echo
	@docker volume ls; echo
	@docker network ls

stop:
	@docker stop container_ganache container_nginx container_contract_deployement
	@echo All containers have been stopped

clean:
	@docker system prune -af
	@docker volume rm srcs_blockchain; true
	@sudo rm -rf ~/blockchain/*
	@echo All images, stopped containers, networks and volumes have been deleted

re: stop clean all
