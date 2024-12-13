import { execSync } from 'child_process';

export const runBiome = async (filePath: string) => {
  try {
    // nosemgrep: javascript.lang.security.detect-child-process.detect-child-process
    execSync(`npx biome check --fix --unsafe ${filePath}`, { stdio: 'inherit' });
    console.log(`Biome formatting applied to ${filePath}`);
  } catch (error) {
    console.error('Error running Biome on %s:', filePath, error);
  }
};
