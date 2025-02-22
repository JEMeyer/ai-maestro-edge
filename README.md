# 🚀 We've Moved!

This project has reached the end of its lifecycle and has been **deprecated**. But don’t worry! We've built something even better: **[AI-Maestro](https://github.com/JEMeyer/ai-maestro)**. 

AI-Maestro is a **faster, more scalable, and actively maintained** solution that replaces and improves upon this project. 

We recommend checking it out for a **better experience and continued support**! 🎉

# AI Maestro Edge

## Description
Node service controled by ai-maestro-api.

`npm install ai-maestro-edge`
`npx ai-maestro-edge`

This application is a simple server built using Express that manages the lifecycle and model loading of Ollama or StableDiffusion containers running in Docker. It provides endpoints for creating, destroying, and managing the instances with specific GPUs and ports. The application also supports loading models into these containers.

## Endpoints

- `POST /up-container`: Creates a new instance by spinning up a Docker container with the specified name, GPU IDs, and port. If this is creating a stable diffusion container, you must also pass in diffusionModel with either 'sdxl-turbo' or 'sd-turbo', depending on which model you want the container to run. Returns a 200 status code upon success.
- `POST /down-container`: Stops and removes an existing instance (Docker container) based on its name. If the model you are downing is a diffusion model, also pass in `mode` with the value "diffusion". Returns a 200 status code upon success.
- `POST /down-all-containers`: Stops and removes all instances (Docker containers) - both diffusion models and LLMs. Returns a 200 status code upon success.
- `POST /load-model`: Loads a specified model into a given container by running the 'ollama run MODEL' command for llms, and issues a request to a diffusion container to load that into VRAM. If the model you are downing is a diffusion model, also pass in `mode` with the value "diffusion". Returns a 200 status code upon success.
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

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under Apache 2.0 - see the [LICENSE](LICENSE) file for details.
