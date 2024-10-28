import { execSync } from 'child_process';

export const runBiome = async (filePath: string) => {
  try {
    execSync(`npx biome check --fix --unsafe ${filePath}`, { stdio: 'inherit' });
    console.log(`Biome formatting applied to ${filePath}`);
  } catch (error) {
    console.error(`Error running Biome on ${filePath}:`, error);
  }
};
