import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import { cleanupTempFile, updateOpenApi } from '@onefootprint/request-types/config/update-openapi';
import { addClientConfig } from './add-client-config';
import { updateExports } from './update-exports';
import { updateReactQuery } from './update-react-query';

const createSDKRequests = async () => {
  const clientDir = path.resolve('./');

  const tempPath = 'tempSDKApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'), tempPath);
  await createClient({
    client: '@hey-api/client-axios',
    input: tempPath,
    output: clientDir,
    schemas: false,
    plugins: ['@tanstack/react-query'],
  });
  addClientConfig(path.resolve(clientDir, 'services.gen.ts'), '@onefootprint/request-types');
  updateExports(clientDir);
  updateReactQuery(path.resolve(clientDir, '@tanstack/react-query.gen.ts'), '@onefootprint/request-types');
  // Delete the types.gen.ts file
  const typesGenPath = path.resolve(clientDir, 'types.gen.ts');
  fs.unlinkSync(typesGenPath);
  console.log('Deleted types.gen.ts file');

  runBiome(path.resolve(clientDir, 'services.gen.ts'));
  runBiome(path.resolve(clientDir, '@tanstack/react-query.gen.ts'));
  runBiome(path.resolve(clientDir, 'index.ts'));

  await cleanupTempFile(tempPath);
};

const createDashboardRequests = async () => {
  const clientDir = path.resolve('./dashboard');

  const tempPath = 'tempDashboardApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/dashboard-api-docs.json'), tempPath);
  await createClient({
    client: '@hey-api/client-axios',
    input: tempPath,
    output: clientDir,
    schemas: false,
    plugins: ['@tanstack/react-query'],
  });
  addClientConfig(path.resolve(clientDir, 'services.gen.ts'), '@onefootprint/request-types/dashboard');
  updateExports(clientDir);
  updateReactQuery(path.resolve(clientDir, '@tanstack/react-query.gen.ts'), '@onefootprint/request-types/dashboard');
  // Delete the types.gen.ts file
  const typesGenPath = path.resolve(clientDir, 'types.gen.ts');
  fs.unlinkSync(typesGenPath);
  console.log('Deleted types.gen.ts file');

  runBiome(clientDir);

  await cleanupTempFile(tempPath);
};

createSDKRequests();
createDashboardRequests();
