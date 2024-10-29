import fs from 'fs';

export function addClientConfig(
  filePath: string,
  importTypes: '@onefootprint/request-types' | '@onefootprint/request-types/dashboard',
) {
  // Read the original file
  let content = fs.readFileSync(filePath, 'utf8');

  // New imports to add
  const newImports = `
import { getRequestOptions, preservedKeys } from '@onefootprint/request';
import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
`;

  // New client configuration
  const newClientConfig = `   
const options = getRequestOptions({});
const axiosInstance = applyCaseMiddleware(axios.create(), { preservedKeys });
export const client = createClient(
  createConfig({
    ...options,
    // @ts-ignore
    axios: axiosInstance,
  }),
);
`;

  // Add new imports after the first import statement
  content = content.replace(/(import .+ from '@hey-api\/client-axios';)/, `$1${newImports}`);

  // Replace the import from './types.gen' with '@onefootprint/request-types'
  content = content.replace(/from '\.\/types\.gen';/, `from '${importTypes}';`);

  // Transform URL parameters from camelCase to snake_case
  content = content.replace(/\{(\w+)\}/g, (_, p1) => {
    // Convert the snake_case string (p1) to camelCase
    return `{${p1.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase())}}`;
  });

  // Replace the existing client creation with the new configuration
  content = content.replace(/export const client = createClient\(createConfig\(\)\);/, newClientConfig);

  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('File successfully modified!');
}
