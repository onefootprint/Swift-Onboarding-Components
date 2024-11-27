import fs from 'fs';
import path from 'path';

export function updateExports(filePath: string) {
  const indexPath = path.join(filePath, 'index.ts');

  // Read the current content of index.ts
  let content = fs.readFileSync(indexPath, 'utf8');

  // Remove existing exports
  content = content.replace(/export \* from '\.\/.*';/g, '');

  // Add new exports
  content += "export * from './services.gen';\n";

  content += "export * from './@tanstack/react-query.gen';\n";

  content += 'export * from "axios";\n';
  // Write the updated content back to index.ts
  fs.writeFileSync(indexPath, content, 'utf8');

  console.log('Exports in index.ts have been updated.');
}
