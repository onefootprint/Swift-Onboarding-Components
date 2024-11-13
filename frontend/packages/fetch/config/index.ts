import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import { updateOpenApi } from '@onefootprint/request-types/config/update-openapi';
import fs from 'fs/promises';
import { addClientConfig } from './add-client-config';
import { updateExports } from './update-exports';

const create = async () => {
  const clientDir = path.resolve('src');

  // Clean-up src/ folder if it exists
  await fs.rm(clientDir, { recursive: true, force: true });
  console.log('Deleted existing src folder');

  const tempPath = 'tempSDKApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'), tempPath);
  await createClient({
    client: '@hey-api/client-fetch',
    input: tempPath,
    output: clientDir,
    schemas: false,
  });
  addClientConfig(path.resolve(clientDir, 'services.gen.ts'));
  await updateExports(clientDir);

  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  await fs.copyFile(path.join(currentDir, 'request.ts'), path.resolve(clientDir, 'request.ts'));
  await fs.copyFile(path.join(currentDir, 'transform-data.ts'), path.resolve(clientDir, 'transform-data.ts'));

  // Delete the types.gen.ts file
  const typesGenPath = path.resolve(clientDir, 'types.gen.ts');

  await fs.unlink(typesGenPath);
  await fs.unlink(tempPath);

  runBiome(clientDir);
};

create();
