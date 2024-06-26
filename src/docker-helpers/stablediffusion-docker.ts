import { execSync } from 'child_process';

export async function startSDContainer(
  containerName: string,
  gpuIds: string[],
  port: string,
  model: string
) {
  try {
    const gpuDevices = gpuIds.join(',');
    const command = `docker run -d
      --name ${containerName}
      -p ${port}:8000
      -e MODEL_NAME=${model}
      --gpus '"device=${gpuDevices}"'
      --restart unless-stopped
      ghcr.io/jemeyer/stablediffusion-fastapi-multigpu:latest`;

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

export function getSDContainerIds() {
  return execSync(
    `docker ps -q --filter "ancestor=ghcr.io/jemeyer/stablediffusion-fastapi-multigpu"`
  )
    .toString()
    .trim();
}

export async function loadSDModelToGPUs(containerName: string) {
  // Get container IP address (replaces `containerName` with your actual container name)
  const ipAddress = execSync(
    `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerName}`
  )
    .toString()
    .trim();

  const url = `http://${ipAddress}:8000/txt2img`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'warm-up' }),
  });
}
