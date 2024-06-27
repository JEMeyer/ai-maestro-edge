import { execSync } from 'child_process';

import { getSDContainerIds } from './stablediffusion-docker';
import { getCoquiContainerIds } from './coqui-docker';
import { getOllamaContainerIds } from './ollama-docker';
import { getWhisperContainerIds } from './whisper-docker';

export async function stopContainer(containerName: string) {
  try {
    execSync(`docker stop ${containerName}`, { stdio: 'inherit' });
    execSync(`docker rm ${containerName}`, { stdio: 'inherit' });
    console.log(`Container ${containerName} stopped and removed successfully.`);
  } catch (error) {
    console.error(`Error stopping container ${containerName}:`, error);
  }
}

export async function stopAllContainers() {
  try {
    // Get all container IDs for containers we made (ollama, sd, coqui)
    const containerIds =
      getSDContainerIds() +
      getOllamaContainerIds() +
      getCoquiContainerIds() +
      getWhisperContainerIds();

    if (containerIds) {
      // Stop all containers with the specified image
      execSync(`docker stop ${containerIds}`, { stdio: 'inherit' });
      console.log(`All containers stopped and removed successfully.`);
    } else {
      console.log(`No containers found.`);
    }
  } catch (error) {
    console.error(`Error stopping containers:`, error);
  }
}

export async function getLogs(
  containerName: string,
  tail: number,
  since?: number
) {
  try {
    let command = `docker logs ${containerName} --tail=${tail}`;

    if (since !== undefined) {
      command += ` --since=${since}s`;
    }
    const logs = execSync(command, { encoding: 'utf-8' });
    return logs.trim();
  } catch (error) {
    console.error(`Error getting logs for container ${containerName}:`, error);
    throw error;
  }
}
