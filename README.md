# llm-manager-edge

Node service controled by llm-manager
`npm install llm-manager-edge`
`npx llm-manager-edge`

Title: Ollama Docker Management Application

## Description

This application is a simple server built using Express that manages the lifecycle and model loading of Ollama containers running in Docker. It provides endpoints for creating, destroying, and managing Ollama instances with specific GPUs and ports. The application also supports loading models into these containers.

## Endpoints

- `POST /up-container`: Creates a new Ollama instance by spinning up a Docker container with the specified name, GPU IDs, and port. Returns a 200 status code upon success.
- `POST /down-container`: Stops and removes an existing Ollama instance (Docker container) based on its name. Returns a 200 status code upon success.
- `POST /down-all-containers`: Stops and removes all Ollama instances (Docker containers). Returns a 200 status code upon success.
- `POST /load-model`: Loads a specified model into a given container by running the 'ollama run MODEL' command for that container and model. Returns a 200 status code upon success.
- `GET /health`: A simple health check endpoint, which returns a 200 status code if the server is running.

## Requirements

- Node.js (>=18)
- Docker
- Ollama/ollama image in Docker

## Installation and Usage

1. Clone this repository: `git clone <repository_url>`
2. Navigate to the project directory: `cd <project_directory>`
3. Install dependencies: `npm install`
4. Start the server: `npm start` or `node main.ts`
5. Use an API client such as Postman, Curl, or Insomnia to send requests to the provided endpoints.
