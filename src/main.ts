import express, { Request, Response } from 'express';
import minimist from 'minimist';

import {
  loadModelToGPUs,
  startOllamaContainer,
  stopAllOllamaContainers,
  stopOllamaContainer,
} from './docker-helpers/ollama-docker';
import {
  startSDContainer,
  stopAllSDContainers,
  stopSDContainer,
} from './docker-helpers/stablediffusion-docker';

const args = minimist(process.argv.slice(2));
const port = args.port || 4000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to create a new instance (or make sure it's up)
app.post('/up-container', async (req, res) => {
  const { containerName, gpuIds, port, diffusionModel } = req.body as {
    containerName: string;
    port: string;
    gpuIds: string[];
    diffusionModel?: string;
  };

  // Spin up container with specified name, GPU, port.
  if (diffusionModel != null)
    await startSDContainer(containerName, gpuIds, port, diffusionModel);

  // Assume/fall back to Ollama if not valid
  await startOllamaContainer(containerName, gpuIds, port);

  res.sendStatus(200);
});

app.post('/down-container', async (req, res) => {
  const { containerName, mode } = req.body as {
    containerName: string;
    mode?: string;
  };

  if (mode === 'diffusion') await stopSDContainer(containerName);

  await stopOllamaContainer(containerName);

  res.sendStatus(200);
});

app.post('/down-all-containers', async (_req, res) => {
  // Will destroy all containers that *may* have been made by us
  await Promise.all([stopAllSDContainers(), stopAllOllamaContainers()]);

  res.sendStatus(200);
});

// Endpoint to receive command to load model into Ollama. Stable diffusion will auto-load on startup
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

app.listen(port, () => {
  console.log(`Edge server listening on port ${port}`);
});
