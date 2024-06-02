import { downAll, downOne, exec, upOne } from 'docker-compose/dist/v2';
import { join } from 'path';

const dockerFilesPath = join(__dirname, '..', 'dockerfiles');

export async function startOllamaContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  try {
    const options = {
      cwd: dockerFilesPath,
      env: {
        NVIDIA_VISIBLE_DEVICES: gpuIds.join(','),
        COMPOSE_PORT: port,
        CONTAINER_NAME: containerName,
      },
      config: 'docker-compose-ollama-gpu.yml',
      log: true,
    };

    console.log('Starting container with the following options:', options);

    await upOne('ollama', options);
  } catch (error) {
    console.error(
      `Error starting container ${containerName} with gpus ${gpuIds} on port ${port}:`,
      error
    );
  }
}

export async function stopOllamaContainer(containerName: string) {
  try {
    await downOne(containerName, {
      cwd: dockerFilesPath,
      config: 'docker-compose-ollama-gpu.yml',
    });
    console.log(`Container ${containerName} stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllOllamaContainers() {
  try {
    await downAll({
      cwd: dockerFilesPath,
      config: 'docker-compose-ollama-gpu.yml',
      log: true,
    });
    console.log(`All containers stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping all ollama containers:`, error);
  }
}

export async function loadModelToGPUs(
  containerName: string,
  modelName: string
) {
  try {
    await exec(containerName, `ollama pull ${modelName}`, {
      cwd: dockerFilesPath,
      config: 'docker-compose-ollama-gpu.yml',
    });
    await exec(containerName, `ollama keep-alive ${modelName} -1`, {
      cwd: dockerFilesPath,
      config: 'docker-compose-ollama-gpu.yml',
    });
  } catch (error) {
    console.error(
      `Error starting model ${modelName}, for container ${containerName}:`,
      error
    );
  }
}
