import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import fs from 'fs/promises';
import { keyTypestoCamelCase } from './key-types-to-camel-case';
import { runBiome } from './run-biome';
import { updateOpenApi } from './update-openapi';

const createSDKTypes = async () => {
  const clientDir = path.resolve('./');

  const tempPath = 'tempSDKApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'), tempPath);
  await createClient({
    input: tempPath,
    output: clientDir,
    schemas: false,
    services: false,
  });

  await keyTypestoCamelCase(path.resolve(clientDir, 'types.gen.ts'));

  runBiome(path.resolve(clientDir, 'types.gen.ts'));
  runBiome(path.resolve(clientDir, 'index.ts'));

  await fs.unlink(tempPath);
};

const createDashboardTypes = async () => {
  const tempDir = path.resolve('temp');

  const tempPath = 'tempDashboardApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/dashboard-api-docs.json'), tempPath);
  await createClient({
    input: tempPath,
    output: tempDir,
    schemas: false,
    services: false,
  });

  const generatedTypesPath = path.resolve(tempDir, 'types.gen.ts');
  const dashboardTypesPath = path.resolve('dashboard.ts');

  await keyTypestoCamelCase(generatedTypesPath);

  await fs.writeFile(dashboardTypesPath, '');

  await fs.rename(generatedTypesPath, dashboardTypesPath);

  runBiome(dashboardTypesPath);

  await fs.rm(tempDir, { recursive: true, force: true });

  await fs.unlink(tempPath);
};

const generate = async () => {
  await createSDKTypes();
  await createDashboardTypes();
};

generate();
