DEV_DIR = docker/dev
PROD_DIR = docker/prod

# Dev
dev-up:
	docker-compose --env-file .env -f $(DEV_DIR)/docker-compose.yaml up --build

dev-down:
	docker-compose --env-file .env -f $(DEV_DIR)/docker-compose.yaml down

dev-logs:
	docker-compose -f $(DEV_DIR)/docker-compose.yaml logs -f

# Prod
prod-up:
	docker-compose --env-file .env -f $(PROD_DIR)/docker-compose.yaml up --build -d

prod-down:
	docker-compose --env-file .env -f $(PROD_DIR)/docker-compose.yaml down

prod-logs:
	docker-compose -f $(PROD_DIR)/docker-compose.yaml logs -f

# Crean
clean:
	docker system prune -f