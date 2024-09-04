.PHONY: run migrate-db import-dashboard stop restart build rebuild cli

# Run docker containers
run:
	docker-compose up -d

# Run database migrations
migrate-db:
	docker-compose exec db bash -c 'for file in /migrations/*.sql; do echo "Running migration $$file"; psql -U $$POSTGRES_USER -d $$POSTGRES_DB -f $$file; done'

# Import GitHub Users dashboard to Kibana
import-dashboard:
	curl -X POST "http://localhost:5601/api/saved_objects/_import?overwrite=true" -H "kbn-xsrf: true" -F "file=@conf/kibana/dashboard.ndjson"

# Stop docker containers
stop:
	docker-compose down

# Restart docker containers
restart:
	make stop && make run

# Build the project
build:
	npm install && npm run build && cp .env dist/ && cp src/services/populate/users.json dist/services/populate/users.json

# Rebuild the project
rebuild:
	make stop && rm -rf node_modules && rm -rf dist && make build

# Run CLI commands
cli:
	docker-compose up -d db && node dist/cli.js
