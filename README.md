# GitHub User CLI
GitHub User CLI is a command-line application designed to fetch GitHub users, store them in a PostgreSQL database,
and interact with the stored data using various commands. This project also includes a web server for serving data,
Elasticsearch for statistics, and AI integration for voice and text-based assistance.
Additionally, Swagger API documentation is available for the web server.

## Features
* Fetch and store GitHub user data in a PostgreSQL database
* Interact with stored users using various CLI commands (add, delete, get users)
* Web server to serve stored data and provide additional services
* Elasticsearch integration for analytics and statistics
* Kibana for visualizing GitHub user data
* Logstash for managing log data and database interactions
* AI integration for voice and text assistance
* Swagger API documentation for the web server
* Populate tool to seed the database with 1000 sample users for testing purposes

## Prerequisites
Ensure you have the following installed:
* Docker
* Docker Compose

## Setup
1. Clone the repository:
```sh
git clone https://github.com/your-username/github-user-cli.git
cd github-user-cli
```

2. Create an `.env` file based on the `.env.example` file:
```sh
cp .env.example .env
```
Fill in the required environment variables in the .env file, such as database ENVs, `GITHUB_API_URL`, `OPENAI_URL` and `OPENAI_KEY`, and other variables.

You can use this link to generate OpenAI API key: https://platform.openai.com/api-keys

3. Build the project and run the Docker containers:
```sh
make build
make run
```

4. Run database migrations:
```sh
make migrate-db
```

5. Import Kibana dashboard:
```sh
make import-dashboard
```

Now you have everything running: Postgres database, web server, Elasticsearch, Kibana, and Logstash.

## Running the CLI
To access the CLI, run:
```sh
make cli
```

You can then execute various commands using the CLI:

### Add a GitHub User
```sh
add-user <username>
```

### Update a GitHub User
```sh
update-user <username>
```

### Delete a GitHub User
```sh
delete-user <username>
```

### Get a GitHub User
```sh
get-user <username>
```

### Get All Users with Filters
```sh
get-users --location <location> --company <company> --language <language> --sort <sort>
```
Or:
```sh
get-users -l <location> -c <company> -L <language> -s <sort>
```

### Populate the Database with Sample Users
To seed the database with 1000 sample users for testing purposes:
```sh
populate
```

### Ask the AI for Assistance
```sh
ai <your query>
```
Example of query: `Find users from Istanbul who are working in LovelyStay. They should have TypeScript projects in their GitHub. Please sort the results by followers.`

## Additional Commands
### View Web Server Logs
```sh
make logs
```

### Restart the Service:
```sh
make restart
```

### Rebuild the Whole Project:
```sh
make rebuild
```

### Rollback All Database Migrations
```sh
rollback-db
```

## Running Tests
The project uses Jest for testing. To run tests, simply execute:
```sh
make test
```

## Swagger API Documentation
The Swagger API documentation is available at:

* `http://localhost:${HTTP_PORT}/api-docs`


## Additional Information
* Docker: All services (PostgreSQL, Elasticsearch, Kibana, Logstash) are orchestrated using Docker Compose for seamless setup.
* Elasticsearch: Used for storing and analyzing statistics about GitHub users.
* Kibana: Provides dashboards and visualizations for GitHub user data.
* Logstash: Manages logs and data synchronization with the database.
* AI Integration: Offers voice and text assistance to interact with the CLI in a more intuitive way. 
* Swagger API Documentation: Provides a detailed API documentation for interacting with the web server.

## Troubleshooting Guide
If you encounter any issues during setup or while running the services, refer to the following solutions:

### Docker and Docker Compose Compatibility Issues
If you're experiencing issues while running services, it’s essential to ensure that Docker and Docker Compose versions are compatible together.
To resolve this, you can update Docker and Docker Compose to the latest versions using the following commands:
```sh
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
sudo apt-get install docker-compose-plugin
```

### Web Server Fails to Start
Check the service logs to identify any errors:
```sh
make logs
```
This will give you detailed logs of what might be causing the failure. Often, database connection issues or missing environment variables can cause the web server not to start correctly.

### Database Migration Issues
If database migrations fail, verify that your PostgreSQL service is running and that the connection details in the `.env` file are correct.

### Elasticsearch or Kibana Not Working
Ensure that the necessary environment variables for Elasticsearch and Kibana are properly set in the `.env` file.
If the services are failing to start, verify the logs for any errors:
```sh
docker logs elasticsearch
docker logs kibana
```

#### Elasticsearch Persistent Volume Issues
If you encounter issues with the Elasticsearch persistent volume, try adjusting the ownership and permissions of the `es_data` directory with the following commands:
```sh
sudo chown -R 1000:1000 ./es_data
sudo chmod -R 755 ./es_data
```

### GitHub API Rate Limit Issues
If you encounter rate limit errors while fetching data from the GitHub API, you can follow the guidelines on how to handle and avoid rate limits here:
[GitHub API Rate Limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
