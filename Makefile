.PHONY: run migrate-db stop restart build rebuild cli

# Run docker containers
run:
	docker-compose up -d

# Run database migrations
migrate-db:
	docker-compose exec db bash -c 'for file in /migrations/*.sql; do echo "Running migration $$file"; psql -U $$POSTGRES_USER -d $$POSTGRES_DB -f $$file; done'

# Stop docker containers
stop:
	docker-compose down

# Restart docker containers
restart:
	docker-compose down && docker-compose up -d

# Build the project
build:
	npm install && npm run build && cp .env dist/ && docker-compose up --build -d

# Rebuild the project
rebuild:
	docker-compose down && rm -rf node_modules && rm -rf dist && npm install && npm run build && cp .env dist/ && docker-compose up --build -d

# Run CLI commands
cli:
	node dist/index.js $(filter-out $@,$(MAKECMDGOALS))

# Prevent make from interpreting the CLI commands as targets
%:
	@:
