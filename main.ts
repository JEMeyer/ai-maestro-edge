import express from 'express';
import { DockerClient } from 'docker-client';

const app = express();
const docker = new DockerClient();

// Endpoint to receive command to load model
app.post('/load-model', async (req, res) => {
  const { modelId, gpuId, port } = req.body;

  // Spin up Docker container with specified model, GPU, port
  await docker.containers.create({
    Image: 'model-inference-server',
    Env: [`MODEL_ID=${modelId}`, `GPU_ID=${gpuId}`],
    ExposedPorts: {[`${port}/tcp`]: {} },
    // ...
  });

  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(4000, () => {
  console.log('Child server listening on port 4000');
});
