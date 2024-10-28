import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { addClientConfig } from './add-client-config';
import { runBiome } from './run-biome';
import { updateExports } from './update-exports';
import { updateReactQuery } from './update-react-query';

const create = async () => {
  const clientDir = path.resolve('src');

  // Clean-up src/ folder if it exists
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
    console.log('Deleted existing src folder');
  }

  await createClient({
    client: '@hey-api/client-axios',
    input: path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'),
    output: clientDir,
    schemas: false,
    plugins: ['@tanstack/react-query'],
  });
  addClientConfig(path.resolve(clientDir, 'services.gen.ts'));
  updateExports(clientDir);
  updateReactQuery(path.resolve(clientDir, '@tanstack/react-query.gen.ts'));
  // Delete the types.gen.ts file
  const typesGenPath = path.resolve(clientDir, 'types.gen.ts');
  if (fs.existsSync(typesGenPath)) {
    fs.unlinkSync(typesGenPath);
    console.log('Deleted types.gen.ts file');
  }

  runBiome(clientDir);
};

create();
