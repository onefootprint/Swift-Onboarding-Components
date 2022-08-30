import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import path from 'path';
import readingTime from 'reading-time';

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

const getSectionMeta = (text: string) => {
  const level = text.split('#').length - 1;
  const label = text.split('#').join('').trim();
  const id = kebabCase(label);
  const anchor = `#${id}`;
  return { label, level, anchor, id };
};

const getSections = (content: string) => {
  // Code blocks might contain special characters like # header tags, so ignore these
  const regXCode = /```[a-zA-Z0-9]+?\n([\s\S]+?)\n```\n/gi;
  const contentWithoutCode = content.replaceAll(regXCode, '');
  const regXHeader = /#{1,6}.+/g;
  const sections = contentWithoutCode.match(regXHeader);
  return sections ? sections.map(getSectionMeta) : [];
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
          readingTime: readingTime(matterFile.content),
          sections: [
            getSectionMeta(`#${matterFile.data.title}`),
            ...getSections(matterFile.content),
          ],
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
