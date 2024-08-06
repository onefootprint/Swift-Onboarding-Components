import * as fs from 'fs';
import * as path from 'path';

export type FileContents = {
  name: string;
  contents: string;
};

export function loadContentFiles(dirPath: string): Array<FileContents> {
  const contents: Array<FileContents> = [];

  const files = fs.readdirSync(dirPath);

  files.map(file => {
    const filePath: string = path.join(dirPath, file);
    const data = fs.readFileSync(filePath, 'utf8');
    contents.push({
      name: path.parse(filePath).base.split('.')[0],
      contents: data,
    });
  });

  return contents;
}
