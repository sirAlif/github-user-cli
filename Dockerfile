# Use an official Node.js runtime as a parent image
FROM node:22.7.0-alpine

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

# Expose the web server port
EXPOSE 6789

# Run the web server
CMD ["node", "dist/server.js"]
