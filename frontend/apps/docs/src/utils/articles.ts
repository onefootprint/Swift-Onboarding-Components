import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import readingTime from 'reading-time';

import type { Article } from '../types/article';
import type { PageNavigationCategory } from '../types/page';

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
  const regXHeader = /#{1,6}\s([^\n[\]`]+)\n/g;
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
  const filesPath = await getFilesPath('src/content/**/**.mdx');
  return getAllMarkdownFiles(filesPath);
};

export const getArticlesByPage = async (page: string) => {
  const filesPath = await getFilesPath('src/content/**/**.mdx');
  const articles = await getAllMarkdownFiles(filesPath);
  return articles.filter(article => article.data.page === page);
};

export const getArticleBySlug = async (slug: string) => {
  const articles = await getAllArticles();
  return articles.find(article => article.data.slug === slug);
};

export const getNavigationByPage = async (page: string) => {
  const navigation = new Map<string, PageNavigationCategory>();
  const articles = await getArticlesByPage(page);

  const findOrCreateCategory = (name: string) => {
    if (!navigation.has(name)) {
      navigation.set(name, { name, items: [] });
    }
    return navigation.get(name);
  };

  articles.forEach(({ data: { category, title, position, slug } }) => {
    const navigationCategory = findOrCreateCategory(category);
    if (navigationCategory) {
      navigationCategory.items.push({
        title,
        position,
        slug,
      });
    }
  });
  return Array.from(navigation).map(([, { name, items }]) => ({
    name,
    items: items.sort((a, b) => a.position - b.position),
  }));
};
