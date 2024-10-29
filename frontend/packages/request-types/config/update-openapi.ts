import path from 'path';
import fs from 'fs/promises';

// Function to provide a hotfix to the openAPI schema to unblock the frontend
export const updateOpenApi = async () => {
  const openAPIPath = path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json');
  const openAPIContent = await fs.readFile(openAPIPath, 'utf-8');
  const openAPI = JSON.parse(openAPIContent);

  // ticket: FE-739
  if (openAPI.components?.schemas?.UserDecryptRequest?.properties?.transforms?.items.enum) {
    openAPI.components.schemas.UserDecryptRequest.properties.transforms.items.enum = [
      'to_lowercase',
      'to_uppercase',
      'to_ascii',
      'prefix(<n>)',
      'suffix(<n>)',
      'replace(<from>,<to>)',
      'date_format(<from_format>,<to_format>)',
      'hmac_sha256(<key>)',
      'encrypt(<algorithm>,<public_key>)',
    ];
  }

  const tempPath = './temp.json';
  await fs.writeFile(tempPath, JSON.stringify(openAPI, null, 2));
  return tempPath;
};

export const cleanupTempFile = async (tempPath: string) => {
  await fs.unlink(tempPath);
};
