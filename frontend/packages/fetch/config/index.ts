import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import { addClientConfig } from './add-client-config';
import { updateExports } from './update-exports';

const create = async () => {
  const clientDir = path.resolve('src');

  // Clean-up src/ folder if it exists
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
    console.log('Deleted existing src folder');
  }

  await createClient({
    client: '@hey-api/client-fetch',
    input: path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'),
    output: clientDir,
    schemas: false,
  });
  addClientConfig(path.resolve(clientDir, 'services.gen.ts'));
  updateExports(clientDir);

  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  fs.copyFileSync(path.join(currentDir, 'request.ts'), path.resolve(clientDir, 'request.ts'));
  fs.copyFileSync(path.join(currentDir, 'transform-data.ts'), path.resolve(clientDir, 'transform-data.ts'));

  // Delete the types.gen.ts file
  const typesGenPath = path.resolve(clientDir, 'types.gen.ts');
  if (fs.existsSync(typesGenPath)) {
    fs.unlinkSync(typesGenPath);
    console.log('Deleted types.gen.ts file');
  }

  runBiome(clientDir);
};

create();
