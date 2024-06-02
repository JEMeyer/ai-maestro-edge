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

    console.log('Starting container with the following command:', command);

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
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllSDContainers() {
  try {
    // Get all container IDs for containers with the image "ghcr.io/jemeyer/stablediffusion-fastapi-multigpu:latest"
    const containerIds = execSync(
      `docker ps -q --filter "ancestor=ghcr.io/jemeyer/stablediffusion-fastapi-multigpu"`
    )
      .toString()
      .trim();

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
    console.error(`Error stopping containers:`, error);
  }
}
