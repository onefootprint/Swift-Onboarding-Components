import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import path from 'path';

import type { Page } from '../types/page';

const DOCS_PATH = path.join(process.cwd(), 'src/content/**/**.mdx');

const getFilesPath = (filesPath: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    glob(filesPath, (err, contentPaths) => {
      if (err) {
        reject(err);
      } else {
        resolve(contentPaths);
      }
    });
  });

const getPages = (contentPaths: string[]) =>
  Promise.all(
    contentPaths.map(async contentPath => {
      const fileContent = await fs.promises.readFile(contentPath, {
        encoding: 'utf8',
      });
      const matterFile = matter(fileContent) as unknown as Page;
      return matterFile;
    }),
  );

export const getAllPages = async () => {
  const filesPath = await getFilesPath(DOCS_PATH);
  const pages = await getPages(filesPath);
  return pages;
};

export const getPageBySlug = async (slug: string) => {
  const pages = await getAllPages();
  return pages.find(page => page.data.slug === slug);
};

export const getNavigation = async () => {
  const navigation = new Map<
    string,
    Set<{ title: string; position: number; slug: string }>
  >();
  const pages = await getAllPages();
  pages.forEach(({ data: { section, title, position, slug } }) => {
    if (navigation.has(section)) {
      const set = navigation.get(section);
      if (set) {
        set.add({ title, position, slug });
      }
    } else {
      const set = new Set<{ title: string; position: number; slug: string }>();
      set.add({ title, position, slug });
      navigation.set(section, set);
    }
  });
  return navigation;
};
