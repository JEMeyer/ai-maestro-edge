# Use a minimal Node.js base image
FROM node:18-alpine as base

# Install Docker CLI, Docker Compose, and shadow package for user management
RUN apk add --no-cache docker docker-cli-compose shadow

# Install PM2 globally as root
RUN npm install -g pm2

# Create a non-root user and add it to the docker group
ARG USERNAME=appuser
ARG USER_UID=1000
ARG USER_GID=1000

# Check if the GID is already in use, if so, find an available GID
RUN addgroup -g $USER_GID $USERNAME && \
    adduser --disabled-password -u $USER_UID -G $USERNAME $USERNAME && \
    addgroup $USERNAME docker

# Switch to the non-root user
USER $USERNAME

# Builder stage
FROM base AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project files
COPY . .

# Build the TypeScript code to JavaScript
RUN npm run build

# Final runtime image
FROM base

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files from the builder image
COPY --from=builder /app/package*.json ./

# Copy the built JavaScript files from the builder image
COPY --from=builder /app/dist ./dist

# Copy the needed dockerfiles to the dockerfiles folder
COPY --from=builder /app/src/dockerfiles ./dist/dockerfiles/

# Install production dependencies
RUN npm ci --only=production

# Expose the port your application listens on
EXPOSE 4000

# Start the application using PM2
CMD ["pm2-runtime", "dist/main.js"]
