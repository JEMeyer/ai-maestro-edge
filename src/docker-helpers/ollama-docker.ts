import { downOne, exec, upOne } from 'docker-compose/dist/v2';
import { join } from 'path';

export async function startOllamaContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  await upOne('ollama', {
    commandOptions: ['--project-name', containerName],
    env: {
      NVIDIA_VISIBLE_DEVICES: gpuIds.join(','),
      COMPOSE_PORT: port,
    },
    cwd: join(__dirname, '..', 'dockerfiles'),
    config: 'docker-compose-ollama-gpu.yml',
    log: true,
  });
}

export async function stopOllamaContainer(containerName: string) {
  try {
    await downOne(containerName, {
      commandOptions: ['--project-name', containerName],
      cwd: join(__dirname, '..', 'dockerfiles'),
      config: 'docker-compose-ollama-gpu.yml',
      log: true,
    });
    console.log(`Container ${containerName} stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function loadModelToGPUs(
  containerName: string,
  modelName: string
) {
  await exec(containerName, `ollama run ${modelName}`, {
    cwd: join(__dirname, '..', 'dockerfiles'),
    config: 'docker-compose-ollama-gpu.yml',
  });
}
