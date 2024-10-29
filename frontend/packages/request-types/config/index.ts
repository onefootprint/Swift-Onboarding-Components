import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { keyTypestoCamelCase } from './key-types-to-camel-case';
import { runBiome } from './run-biome';
import { cleanupTempFile, updateOpenApi } from './update-openapi';

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

  keyTypestoCamelCase(path.resolve(clientDir, 'types.gen.ts'));

  runBiome(path.resolve(clientDir, 'types.gen.ts'));
  runBiome(path.resolve(clientDir, 'index.ts'));

  await cleanupTempFile(tempPath);
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

  keyTypestoCamelCase(generatedTypesPath);

  if (!fs.existsSync(dashboardTypesPath)) {
    fs.writeFileSync(dashboardTypesPath, '');
  }
  fs.rename(generatedTypesPath, dashboardTypesPath, err => {
    if (err) {
      console.error('Error renaming file:', err);
    } else {
      runBiome(dashboardTypesPath);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  cleanupTempFile(tempPath);
};

createSDKTypes();
createDashboardTypes();
