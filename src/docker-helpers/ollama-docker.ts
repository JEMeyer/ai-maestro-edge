import { downAll, downOne, exec, upOne } from 'docker-compose/dist/v2';
import { join } from 'path';

export async function startOllamaContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  await upOne('ollama', {
    env: {
      NVIDIA_VISIBLE_DEVICES: gpuIds.join(','),
      COMPOSE_PORT: port,
      CONTAINER_NAME: containerName,
    },
    log: true,
    composeOptions: [
      '--file',
      '../dockerfiles/docker-compose-ollama-gpu.yml',
      'up',
      '-d',
      '--no-recreate',
    ],
  });
}

export async function stopOllamaContainer(containerName: string) {
  try {
    await downOne(containerName);
    console.log(`Container ${containerName} stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllOllamaContainers() {
  try {
    await downAll({
      cwd: join(__dirname, '..', 'dockerfiles'),
      config: 'docker-compose-ollama-gpu.yml',
      log: true,
    });
    console.log(`All containers stopped successfully.`);
  } catch (error) {
    console.error(`Error ollama stopping containers:`, error);
  }
}

export async function loadModelToGPUs(
  containerName: string,
  modelName: string
) {
  await exec(containerName, `ollama pull ${modelName}`, {
    cwd: join(__dirname, '..', 'dockerfiles'),
    config: 'docker-compose-ollama-gpu.yml',
  });
  await exec(containerName, `ollama keep-alive ${modelName} -1`, {
    cwd: join(__dirname, '..', 'dockerfiles'),
    config: 'docker-compose-ollama-gpu.yml',
  });
}
