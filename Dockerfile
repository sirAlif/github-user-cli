# Stage 1: Build stage
FROM node:22.7.0-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build


# Stage 2: Production stage
FROM node:22.7.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=builder /app /app

# Expose the web server port
EXPOSE 6789

# Run the web server
CMD ["node", "dist/server.js"]
