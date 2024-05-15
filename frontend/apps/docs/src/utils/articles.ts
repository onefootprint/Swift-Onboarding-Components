import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import readingTime from 'reading-time';

import type { Article } from '../types/article';
import type {
  PageNavigation,
  PageNavigationCategory,
  PageNavigationItem,
} from '../types/page';
import getSectionMeta from './section';

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

const getSections = (content: string) => {
  const regXCode = /```[a-zA-Z0-9]+?\n([\s\S]+?)\n```\n/gi;
  const contentWithoutCode = content.replace(regXCode, '');
  const regXHeader = /#{1,6}\s([^\n`]+)\n/g;
  const sections = contentWithoutCode.match(regXHeader);
  return sections ? sections.map(getSectionMeta) : [];
};

const replaceContent = (content: string) => {
  const outputLines: string[] = [];
  let isInCodeBlock = false;
  const headerRegex = /#{1,6}\s([^\n[\]`]+)/g;
  const parentSections: { level: number; id: string }[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
    }
    if (!isInCodeBlock && !!line.match(headerRegex)) {
      const label = line.split('#').join('').trim();
      const id = kebabCase(label);
      const level = line.split('#').length - 1;
      while (
        parentSections.length &&
        parentSections[parentSections.length - 1].level >= level
      ) {
        parentSections.pop();
      }
      parentSections.push({ level, id });
      const nestedId = parentSections
        .filter(s => s.level <= level)
        .map(s => s.id)
        .join('-');
      outputLines.push(`${line} [[id=${nestedId}]]`);
    } else {
      outputLines.push(line);
    }
  }
  return outputLines.join('\n');
};

const getAllMarkdownFiles = (contentPaths: string[]): Promise<Article[]> =>
  Promise.all(
    contentPaths.map(async contentPath => {
      const fileContent = await fs.promises.readFile(contentPath, {
        encoding: 'utf8',
      });
      const matterFile = matter(fileContent) as unknown as Article;
      const content = replaceContent(matterFile.content);
      return {
        ...matterFile,
        content,
        data: {
          ...matterFile.data,
          readingTime: readingTime(content),
          sections: [
            getSectionMeta(`#${matterFile.data.title}`),
            ...getSections(content),
          ],
        },
      };
    }),
  );

export const getAllArticles = async (): Promise<Article[]> => {
  const filesPath = await getFilesPath('src/content/**/**.mdx');
  return getAllMarkdownFiles(filesPath);
};

export const getArticlesByPage = async (page: string): Promise<Article[]> => {
  const filesPath = await getFilesPath('src/content/**/**.mdx');
  const articles = await getAllMarkdownFiles(filesPath);
  return articles.filter(article => article.data.page === page);
};

export const getArticleBySlug = async (
  slug: string,
): Promise<Article | undefined> => {
  const articles = await getAllArticles();
  return articles.find(article => article.data.slug === slug);
};

const findOrCreateCategory = (
  navigation: Map<string, PageNavigationCategory>,
  name: string,
): PageNavigationCategory => {
  if (!navigation.has(name)) {
    navigation.set(name, { name, items: [] });
  }
  return navigation.get(name)!;
};

const findOrCreateSubcategory = (
  categoryItem: PageNavigationCategory,
  subcategory?: string,
): PageNavigationItem | PageNavigationCategory => {
  if (!subcategory) return categoryItem;

  let subcategoryItem = categoryItem.items.find(
    item => item.title === subcategory,
  ) as PageNavigationItem;

  if (!subcategoryItem) {
    subcategoryItem = {
      title: subcategory,
      position: 0,
      slug: '',
      items: [],
    };
    categoryItem.items.push(subcategoryItem);
  }
  return subcategoryItem;
};

export const getNavigationByPage = async (
  page: string,
): Promise<PageNavigation> => {
  const navigation = new Map<string, PageNavigationCategory>();
  const articles = await getArticlesByPage(page);

  articles.forEach(
    ({ data: { category, subcategory, title, position, slug, hidden } }) => {
      if (hidden) return;

      const navigationCategory = findOrCreateSubcategory(
        findOrCreateCategory(navigation, category),
        subcategory,
      );

      if (navigationCategory.items) {
        navigationCategory.items.push({
          title,
          position,
          slug,
          items: null,
        });
      }
    },
  );

  return Array.from(navigation.values()).map(({ name, items }) => ({
    name,
    items: items
      .sort((a, b) => a.position - b.position)
      .map(item => ({
        ...item,
        items:
          item.items && item.items.length > 0
            ? item.items.sort((a, b) => a.position - b.position)
            : null,
      })),
  }));
};
