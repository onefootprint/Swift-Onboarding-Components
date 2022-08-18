import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import path from 'path';

import type { Article } from '../types/article';

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

const getArticleSections = (content: string) => {
  const regXHeader = /#{1,6}.+/g;
  const sections = content.match(regXHeader);

  return sections?.map(section => {
    const level = section.split('#').length - 1;
    const label = section.split('#').join('').trim();
    const id = kebabCase(label);
    const anchor = `#${id}`;
    return { label, level, anchor, id };
  });
};

const getAllMarkdownFiles = (contentPaths: string[]) =>
  Promise.all(
    contentPaths.map(async contentPath => {
      const fileContent = await fs.promises.readFile(contentPath, {
        encoding: 'utf8',
      });
      const matterFile = matter(fileContent) as unknown as Article;
      return {
        ...matterFile,
        data: {
          ...matterFile.data,
          sections: getArticleSections(matterFile.content),
        },
      };
    }),
  );

export const getAllArticles = async () => {
  const filesPath = await getFilesPath(DOCS_PATH);
  const articles = await getAllMarkdownFiles(filesPath);
  return articles;
};

export const getArticleBySlug = async (slug: string) => {
  const articles = await getAllArticles();
  return articles.find(article => article.data.slug === slug);
};

export const getNavigation = async () => {
  const navigation = new Map<
    string,
    Set<{ title: string; position: number; slug: string }>
  >();
  const articles = await getAllArticles();
  articles.forEach(({ data: { product, title, position, slug } }) => {
    if (navigation.has(product)) {
      const set = navigation.get(product);
      if (set) {
        set.add({ title, position, slug });
      }
    } else {
      const set = new Set<{ title: string; position: number; slug: string }>();
      set.add({ title, position, slug });
      navigation.set(product, set);
    }
  });
  return navigation;
};
