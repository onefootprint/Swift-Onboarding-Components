import fs from 'fs';

export function addClientConfig(filePath: string) {
  // Read the original file
  let content = fs.readFileSync(filePath, 'utf8');

  // New imports to add
  const newImports = `
import request from './request';
import { keysToCamelCase } from './transform-data'
`;

  // New client configuration
  const newClientConfig = `   
export const client = createClient(createConfig({
  responseTransformer: data => Promise.resolve(keysToCamelCase(data)),
  fetch: request,
}));
`;

  // Add new imports after the first import statement
  content = content.replace(/(import .+ from '@hey-api\/client-fetch';)/, `$1${newImports}`);

  // Replace the import from './types.gen' with '@onefootprint/request-types'
  content = content.replace(/from '\.\/types\.gen';/, "from '@onefootprint/request-types';");

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
