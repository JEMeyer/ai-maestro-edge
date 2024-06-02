import { execSync } from 'child_process';

export async function startOllamaContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  try {
    const gpuDevices = gpuIds.join(',');
    const command = `docker run -d \
    --name ${containerName} \
    -p ${port}:11434 \
    -v ./sharedOllamaDir:/root/.ollama \
    --gpus '"device=${gpuDevices}"' \
    ollama/ollama
  `;

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

export async function stopOllamaContainer(containerName: string) {
  try {
    execSync(`docker stop ${containerName}`, { stdio: 'inherit' });
    execSync(`docker rm ${containerName}`, { stdio: 'inherit' });
    console.log(`Container ${containerName} stopped and removed successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllOllamaContainers() {
  try {
    // Get all container IDs for containers with the name "ollama"
    const containerIds = execSync(
      `docker ps -q --filter "ancestor=ollama/ollama"`
    )
      .toString()
      .trim();

    if (containerIds) {
      // Stop all containers with the ancestor "ollama/ollama"
      execSync(`docker stop ${containerIds}`, { stdio: 'inherit' });
      execSync(`docker rm ${containerIds}`, { stdio: 'inherit' });
      console.log(
        `All containers with ancestor "ollama/ollama" stopped and removed successfully.`
      );
    } else {
      console.log(`No containers with ancestor "ollama/ollama" found.`);
    }
  } catch (error) {
    console.error(`Error stopping all ollama containers:`, error);
  }
}

export async function loadModelToGPUs(
  containerName: string,
  modelName: string
) {
  try {
    // Run the 'ollama pull' command inside the container
    execSync(`docker exec ${containerName} ollama pull ${modelName}`, {
      stdio: 'inherit', // This will print the output to the console
    });

    // Run the 'ollama keep-alive' command inside the container
    execSync(`docker exec ${containerName} ollama keep-alive ${modelName} -1`, {
      stdio: 'inherit', // This will print the output to the console
    });

    console.log(
      `Model ${modelName} loaded and kept alive for container ${containerName}.`
    );
  } catch (error) {
    console.error(
      `Error starting model ${modelName}, for container ${containerName}:`,
      error
    );
  }
}
