import { execSync } from 'child_process';
import { WARMUP_SPEAKER } from '../data/warmup_speaker';

export async function startCoquiContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  try {
    const gpuDevices = gpuIds.join(',');
    const command = `docker run -d
      --name ${containerName}
      -p ${port}:80
      -e COQUI_TOS_AGREED=1
      --gpus '"device=${gpuDevices}"'
      --restart unless-stopped
      ghcr.io/jemeyer/xtts-streaming-server:latest-cuda121`;

    console.log('Starting SD container with the following command:', command);

    execSync(command, { stdio: 'inherit' });
    console.log(`Container ${containerName} started successfully.`);
  } catch (error) {
    console.error(
      `Error starting container ${containerName} with GPUs ${gpuIds} on port ${port}:`,
      error
    );
  }
}

export function getCoquiContainerIds() {
  return execSync(
    `docker ps -q --filter "ancestor=ghcr.io/jemeyer/xtts-streaming-server:latest-cuda121"`
  )
    .toString()
    .trim();
}

export async function loadCoquiModelToGPUs(containerName: string) {
  // Get container IP address (replaces `containerName` with your actual container name)
  const ipAddress = execSync(
    `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerName}`
  )
    .toString()
    .trim();

  const url = `http://${ipAddress}:8000/tts`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'This is a warmup request.',
      language: 'en',
      speaker_embedding: WARMUP_SPEAKER.speaker_embedding,
      gpt_cond_latent: WARMUP_SPEAKER.gpt_cond_latent,
    }),
  });
}
