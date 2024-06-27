import express, { Request, Response } from 'express';
import minimist from 'minimist';

import {
  loadOllamaModelToGPUs,
  startOllamaContainer,
} from './docker-helpers/ollama-docker';
import {
  loadSDModelToGPUs,
  startSDContainer,
} from './docker-helpers/stablediffusion-docker';
import {
  loadCoquiModelToGPUs,
  startCoquiContainer,
} from './docker-helpers/coqui-docker';
import { stopAllContainers, stopContainer } from './docker-helpers/shared';
import { startWhisperContainer } from './docker-helpers/whisper-docker';

const args = minimist(process.argv.slice(2));
const port = args.port || 4000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health-check', (req, res) => {
  res.send('OK');
});

// Endpoint to create a new instance (or make sure it's up)
app.post('/up-container', async (req, res) => {
  const { containerName, gpuIds, port, diffusionModel, mode } = req.body as {
    containerName: string;
    port: string;
    gpuIds: string[];
    diffusionModel?: string;
    mode?: string;
  };

  // Spin up container with specified name, GPU, port.
  if (mode === 'diffusion' && diffusionModel != null)
    await startSDContainer(containerName, gpuIds, port, diffusionModel);
  else if (mode === 'tts')
    await startCoquiContainer(containerName, gpuIds, port);
  else if (mode == 'stt')
    await startWhisperContainer(containerName, gpuIds, port);
  else await startOllamaContainer(containerName, gpuIds, port);

  res.sendStatus(200);
});

app.post('/down-container', async (req, res) => {
  const { containerName } = req.body as {
    containerName: string;
  };

  await stopContainer(containerName);

  res.sendStatus(200);
});

app.post('/down-all-containers', async (_req, res) => {
  // Will destroy all containers that *may* have been made by us
  await stopAllContainers();

  res.sendStatus(200);
});

// Endpoint to receive command to load model into Ollama. Stable diffusion will auto-load on startup
app.post('/load-model', async (req: Request, res: Response) => {
  const { modelName, containerName, mode } = req.body as {
    modelName: string;
    containerName: string;
    mode?: string;
  };

  // Make initial calls the the container. This speeds up later requests.
  if (mode === 'diffusion') await loadSDModelToGPUs(containerName);
  else if (mode === 'tts') await loadCoquiModelToGPUs(containerName);
  else if (mode === 'stt') console.log('up stt here');
  else await loadOllamaModelToGPUs(containerName, modelName);

  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Edge server listening on port ${port}`);
});
