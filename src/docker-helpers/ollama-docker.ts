import { execSync } from 'child_process';
import { getMappedPort } from './utils';

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

    console.log(`Model ${modelName} pulled for ${containerName}.`);

    // Get the port on this machine for the particular container's ollama port
    const port = getMappedPort(containerName, 11434);

    console.log(`Determined ${containerName} is running on port ${port}.`);

    // Run the 'ollama keep-alive' command inside the container
    const response = await fetch(`http://localhost:${port}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        keep_alive: -1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Model ${modelName} kept alive for ${containerName}.`);
  } catch (error) {
    console.error(
      `Error starting model ${modelName}, for container ${containerName}:`,
      error
    );
  }
}
