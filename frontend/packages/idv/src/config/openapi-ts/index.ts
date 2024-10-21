import fs from 'fs';
import path from 'path';
import { createClient } from '@hey-api/openapi-ts';
import { addClientConfig } from './add-client-config';
import { keyTypestoCamelCase } from './key-types-to-camel-case';
import { runBiome } from './run-biome';

const parseArgs = (argv: string[]) => {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || 'true';
    }
  }
  return args;
};

const create = async () => {
  const args = parseArgs(process.argv);
  const shouldCamelCaseKeys = args.camelCaseKeys === 'true';
  const clientDir = path.resolve('src/client');

  // Clean-up src/client/ folder if it exists
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true, force: true });
    console.log('Deleted existing src/client/ folder');
  }

  await createClient({
    client: '@hey-api/client-axios',
    input: path.resolve('../../../scripts/openapi/hosted-openapi.json'),
    output: clientDir,
    schemas: false,
  });

  if (shouldCamelCaseKeys) {
    keyTypestoCamelCase(path.resolve('src/client/types.gen.ts'));
    addClientConfig(path.resolve('src/client/services.gen.ts'));
  }

  runBiome(clientDir);
};

create();
