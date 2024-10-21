import fs from 'fs';

export function addClientConfig(filePath: string) {
  // Read the original file
  let content = fs.readFileSync(filePath, 'utf8');

  // New imports to add
  const newImports = `
import { API_BASE_URL } from '../config/constants';
import request from './request';
import { keysToCamelCase } from './transform-data'
`;

  // New client configuration
  const newClientConfig = `   
export const client = createClient(createConfig({
  baseUrl: API_BASE_URL,
  responseTransformer: data => Promise.resolve(keysToCamelCase(data)),
  fetch: request,
}));
`;

  // Add new imports after the first import statement
  content = content.replace(/(import .+ from '@hey-api\/client-fetch';)/, `$1${newImports}`);

  // Replace the existing client creation with the new configuration
  content = content.replace(/export const client = createClient\(createConfig\(\)\);/, newClientConfig);

  // Write the modified content back to the file
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('File successfully modified!');
}
