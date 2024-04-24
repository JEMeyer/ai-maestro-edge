import express, { Request, Response } from 'express';

import {
  loadModelToGPUs,
  startOllamaContainer,
  stopAllOllamaContainers,
  stopOllamaContainer,
} from './docker-helpers/ollama-docker';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoing to create/destroy a new instance (or make sure it's up)
app.post('/up-container', async (req, res) => {
  const { containerName, gpuIds, port } = req.body as {
    containerName: string;
    port: string;
    gpuIds: string[];
  };

  // Spin up Docker container with specified name, GPU, port
  await startOllamaContainer(containerName, gpuIds, port);

  res.sendStatus(200);
});

app.post('/down-container', async (req, res) => {
  const { containerName } = req.body as { containerName: string };

  // Spin up Docker container with specified name, GPU, port
  await stopOllamaContainer(containerName);

  res.sendStatus(200);
});

app.post('/down-all-containers', async (_req, res) => {
  // Spin up Docker container with specified name, GPU, port
  await stopAllOllamaContainers();

  res.sendStatus(200);
});

// Endpoint to receive command to load model
app.post('/load-model', async (req: Request, res: Response) => {
  const { modelName, containerName } = req.body as {
    modelName: string;
    containerName: string;
  };

  // run 'ollama run MODEL' command for the given container and model
  await loadModelToGPUs(containerName, modelName);

  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(4000, () => {
  console.log('Child server listening on port 4000');
});
