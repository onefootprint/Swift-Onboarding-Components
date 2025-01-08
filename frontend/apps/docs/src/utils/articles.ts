import fs from 'fs';
import { glob } from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import readingTime from 'reading-time';

import type { Article } from '../types/article';
import type { PageNavigation, PageNavigationCategory, PageNavigationItem } from '../types/page';
import getSectionMeta from './section';

const getSections = (content: string) => {
  const regXCode = /```[a-zA-Z0-9]+?\n([\s\S]+?)\n```\n/gi;
  const contentWithoutCode = content.replace(regXCode, '');
  const regXHeader = /#{1,6}\s([^\n`]+)\n/g;
  const sections = contentWithoutCode.match(regXHeader);
  return sections ? sections.map(getSectionMeta) : [];
};

const replaceContent = (content: string) => {
  let isInCodeBlock = false;
  const headerRegex = /#{1,6}\s([^\n[\]`]+)/g;
  const parentSections: { level: number; id: string }[] = [];
  const lines = content.split('\n');

  const outputLines = lines.map(line => {
    if (line.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
    }
    if (!isInCodeBlock && !!line.match(headerRegex)) {
      // Generate an ID for the header elements that is prefixed by all parent sections' IDs.
      // This allows us to generate url hashes that uniquely identify a section header.
      const label = line.split('#').join('').trim();
      const id = kebabCase(label);
      const level = line.split('#').length - 1;
      while (parentSections.length && parentSections[parentSections.length - 1].level >= level) {
        parentSections.pop();
      }
      parentSections.push({ level, id });
      const nestedId = parentSections
        .filter(s => s.level <= level)
        .map(s => s.id)
        .join('-');
      return `${line} [[id=${nestedId}]]`;
    }
    return line;
  });
  return outputLines.join('\n');
};

type BasicArticle = {
  content: string;
  data: {
    title: string;
  };
};

export const getAllMarkdownFiles = async <TArticle extends BasicArticle>(relativePath: string): Promise<TArticle[]> => {
  const contentPaths = await glob(relativePath);
  return Promise.all(
    contentPaths
      .sort((a, b) => a.localeCompare(b))
      .map(async contentPath => {
        try {
          const fileContent = await fs.promises.readFile(contentPath, {
            encoding: 'utf8',
          });
          const matterFile = matter(fileContent) as unknown as TArticle;
          const content = replaceContent(matterFile.content);
          return {
            ...matterFile,
            content,
            data: {
              ...matterFile.data,
              readingTime: readingTime(content),
              sections: [getSectionMeta(`#${matterFile.data.title}`), ...getSections(content)],
            },
          };
        } catch (e) {
          console.log(contentPath);
          throw e;
        }
      }),
  );
};

export const getAllArticles = async (): Promise<Article[]> => {
  return getAllMarkdownFiles<Article>('src/content/default/**/**.mdx');
};

export const getArticlesByPage = async (page: string): Promise<Article[]> => {
  const articles = await getAllMarkdownFiles<Article>('src/content/default/**/**.mdx');
  return articles.filter(article => article.data.page === page);
};

export const getArticleBySlug = async (slug: string): Promise<Article | undefined> => {
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

  let subcategoryItem = categoryItem.items.find(item => item.title === subcategory) as PageNavigationItem;

  if (!subcategoryItem) {
    subcategoryItem = {
      title: subcategory,
      slug: '',
      items: [],
    };
    categoryItem.items.push(subcategoryItem);
  }
  return subcategoryItem;
};

export const getNavigationByPage = async (page: string): Promise<PageNavigation> => {
  const navigation = new Map<string, PageNavigationCategory>();
  const articles = await getArticlesByPage(page);

  articles.forEach(({ data: { category, subcategory, title, slug, hidden } }) => {
    if (hidden) return;

    const navigationCategory = findOrCreateSubcategory(findOrCreateCategory(navigation, category), subcategory);

    if (navigationCategory.items) {
      navigationCategory.items.push({
        title,
        slug,
        items: null,
      });
    }
  });

  const res = Array.from(navigation.values()).map(({ name, items }) => ({
    name,
    items: items.map(item => ({
      ...item,
      items: item.items && item.items.length > 0 ? item.items : null,
    })),
  }));
  return res;
};
