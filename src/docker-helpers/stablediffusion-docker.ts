import { execSync } from 'child_process';

export async function startSDContainer(
  containerName: string,
  gpuIds: string[],
  port: string,
  model: string
) {
  try {
    const gpuDevices = gpuIds.join(',');
    const command = `docker run -d \
      --name ${containerName} \
      -p ${port}:8000 \
      -e MODEL_NAME=${model} \
      --gpus '"device=${gpuDevices}"' \
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

export async function stopSDContainer(containerName: string) {
  try {
    execSync(`docker stop ${containerName}`, { stdio: 'inherit' });
    execSync(`docker rm ${containerName}`, { stdio: 'inherit' });
    console.log(`Container ${containerName} stopped and removed successfully.`);
  } catch (error) {
    console.error(`Error stopping SD container ${containerName}:`, error);
  }
}

function getAllSDContainerIds() {
  return execSync(
    `docker ps -q --filter "ancestor=ghcr.io/jemeyer/stablediffusion-fastapi-multigpu"`
  )
    .toString()
    .trim();
}

export async function stopAllSDContainers() {
  try {
    // Get all container IDs for containers with the image "ghcr.io/jemeyer/stablediffusion-fastapi-multigpu:latest"
    const containerIds = getAllSDContainerIds();

    if (containerIds) {
      // Stop all containers with the specified image
      execSync(`docker stop ${containerIds}`, { stdio: 'inherit' });
      execSync(`docker rm ${containerIds}`, { stdio: 'inherit' });
      console.log(
        `All stable diffusion containers stopped and removed successfully.`
      );
    } else {
      console.log(`No stable diffusion containers found.`);
    }
  } catch (error) {
    console.error(`Error stopping SD containers:`, error);
  }
}

export async function loadSDModelToGPUs(containerName: string) {
  // Get container IP address (replace `containerName` with your actual container name)
  const ipAddress = execSync(
    `docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${containerName}`
  )
    .toString()
    .trim();

  // Construct URL to the endpoint (replace '/endpoint' with the path of your actual endpoint)
  const url = `http://${ipAddress}:8000/txt2img`;

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt: 'warm-up' }),
  });
}
