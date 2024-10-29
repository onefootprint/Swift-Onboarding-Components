import fs from 'fs/promises';

// Function to provide a hotfix to the openAPI schema to unblock the frontend
export const updateOpenApi = async (filePath: string, tempPath: string) => {
  const openAPIContent = await fs.readFile(filePath, 'utf-8');

  // Replace all occurrences of {fp_id:fp_[_A-Za-z0-9]*} with {fp_id}
  const updatedContent = openAPIContent.replace(/{fp_id:fp_\[_A-Za-z0-9\]\*}/g, '{fp_id}');

  // Replace all occurrences of {tag_id:tag_[_A-Za-z0-9]*} with {tag_id}
  const updatedContent2 = updatedContent.replace(/{tag_id:tag_\[_A-Za-z0-9\]\*}/g, '{tag_id}');

  const openAPI = JSON.parse(updatedContent2);

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
  if (openAPI.components?.schemas?.ClientDecryptRequest?.properties?.transforms?.items.enum) {
    openAPI.components.schemas.ClientDecryptRequest.properties.transforms.items.enum = [
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

  await fs.writeFile(tempPath, JSON.stringify(openAPI, null, 2));
};

export const cleanupTempFile = async (tempPath: string) => {
  await fs.unlink(tempPath);
};
