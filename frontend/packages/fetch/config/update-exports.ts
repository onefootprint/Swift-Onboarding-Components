import path from 'path';
import fs from 'fs/promises';

export async function updateExports(filePath: string) {
  const indexPath = path.join(filePath, 'index.ts');

  // Read the current content of index.ts
  let content = await fs.readFile(indexPath, 'utf8');

  // Remove existing exports
  content = content.replace(/export \* from '\.\/.*';/g, '');

  // Add new exports
  content += "export * from './services.gen';\n";

  // Write the updated content back to index.ts
  await fs.writeFile(indexPath, content, 'utf8');

  console.log('Exports in index.ts have been updated.');
}
