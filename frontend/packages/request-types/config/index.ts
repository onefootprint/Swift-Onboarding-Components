import { execSync } from 'child_process';
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

const createKotlinTypes = async () => {
  const tempPath = 'tempKotlinApiDocs.json';
  await updateOpenApi(path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'), tempPath);

  const tempKotlinDir = path.resolve('./kotlin');

  try {
    execSync(
      `openapi-generator-cli generate -i ${tempPath} -g kotlin -o ${tempKotlinDir} -p date-library=kotlinx-datetime -p library=multiplatform --skip-validate-spec --additional-properties dateLibrary=kotlinx-datetime`,
      { stdio: 'inherit' },
    );

    const targetDir = path.resolve(
      '../../../mobile/NativeOnboardingComponents/shared/src/commonMain/kotlin/com/onefootprint/native_onboarding_components',
    );

    // Read and modify the generated API file to fix naming
    const apiFilePath = path.join(
      tempKotlinDir,
      'src/commonMain/kotlin/org/openapitools/client/models/CollectedDataOption.kt',
    );
    let apiFileContent = await fs.readFile(apiFilePath, 'utf8');
    // Replace name("name") with person_name("name") in the content
    apiFileContent = apiFileContent.replace(/name\("name"\)/g, 'person_name("name")');
    // Write the modified content back to the file
    await fs.writeFile(apiFilePath, apiFileContent);

    // Copy all files from source to target directory
    await fs.cp(path.join(tempKotlinDir, 'src/commonMain/kotlin/org/openapitools'), targetDir, {
      recursive: true,
      force: true,
    });

    // Delete the temporary kotlin directory
    await fs.rm(tempKotlinDir, { recursive: true, force: true });

    console.log('Kotlin types generated');
  } catch (error) {
    console.error('Error generating Kotlin types:', error);
  }
  await fs.unlink(tempPath);
};

const generate = async () => {
  await createSDKTypes();
  await createDashboardTypes();
  await createKotlinTypes();
};

generate();
