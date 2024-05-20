import { downAll, downOne, upOne } from 'docker-compose/dist/v2';
import { join } from 'path';

export async function startSDContainer(
  containerName: string,
  gpuIds: string[],
  port: string
) {
  await upOne('stablediffusion-fastapi-multigpu', {
    commandOptions: ['--project-name', 'stablediffusion-fastapi-multigpu'],
    env: {
      NVIDIA_VISIBLE_DEVICES: gpuIds.join(','),
      COMPOSE_PORT: port,
    },
    log: true,
    composeOptions: [
      '--file',
      '../dockerfiles/docker-compose-sd-gpu.yml',
      'up',
      '-d',
      '--no-recreate',
      `--name ${containerName}`,
    ],
  });
}

export async function stopSDContainer(containerName: string) {
  try {
    await downOne(containerName);
    console.log(`Container ${containerName} stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllSDContainers() {
  try {
    await downAll({
      cwd: join(__dirname, '..', 'dockerfiles'),
      config: 'docker-compose-sd-gpu.yml',
      log: true,
    });
    console.log(`All stable diffusion containers stopped successfully.`);
  } catch (error) {
    console.error(`Error stopping containers:`, error);
  }
}
