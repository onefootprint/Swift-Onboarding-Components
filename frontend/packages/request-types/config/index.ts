import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { keyTypestoCamelCase } from './key-types-to-camel-case';
import { runBiome } from './run-biome';
import { cleanupTempFile, updateOpenApi } from './update-openapi';

const create = async () => {
  const clientDir = path.resolve('src');

  // Clean-up src/ folder if it exists
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
    console.log('Deleted existing src folder');
  }

  const tempPath = await updateOpenApi();

  await createClient({
    input: tempPath,
    output: clientDir,
    schemas: false,
    services: false,
  });

  keyTypestoCamelCase(path.resolve(clientDir, 'types.gen.ts'));

  runBiome(clientDir);

  await cleanupTempFile(tempPath);
};

create();
