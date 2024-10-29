import fs from 'fs';

export function updateReactQuery(
  filePath: string,
  importTypes: '@onefootprint/request-types' | '@onefootprint/request-types/dashboard',
) {
  // Read the current content of index.ts
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace the import from './types.gen' with '@onefootprint/request-types'
  content = content.replace(/from '\.\.\/types\.gen';/, `from '${importTypes}';`);

  // Write the updated content back to index.ts
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('Exports in index.ts have been updated.');
}
