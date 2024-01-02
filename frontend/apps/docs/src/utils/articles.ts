import fs from 'fs';
import glob from 'glob';
import matter from 'gray-matter';
import kebabCase from 'lodash/kebabCase';
import readingTime from 'reading-time';

import type { Article } from '../types/article';
import type { PageNavigationCategory } from '../types/page';
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
  // Code blocks might contain special characters like # header tags, so ignore these
  const regXCode = /```[a-zA-Z0-9]+?\n([\s\S]+?)\n```\n/gi;
  const contentWithoutCode = content.replace(regXCode, '');
  const regXHeader = /#{1,6}\s([^\n`]+)\n/g;
  const sections = contentWithoutCode.match(regXHeader);
  return sections ? sections.map(getSectionMeta) : [];
};

/**
 * Replace headers (#, ##, ###, etc) with a markdown string that represents the header title AND header ID to use for an anchor tag.
 * This allows us to generate a unique ID for each section, even if the name of the section is not unique.
 */
const replaceContent = (content: string) => {
  const outputLines = [];
  let isInCodeBlock = false;
  const headerRegex = /#{1,6}\s([^\n[\]`]+)/g;

  // parentSections keeps track of the nested structure of the markdown file - all sections that
  // are parents of the current section will be stored in parentSections.
  const parentSections = [];

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('```')) {
      isInCodeBlock = !isInCodeBlock;
    }
    // Code blocks may contain `#` characters and not be acutal markdown headers
    if (!isInCodeBlock && !!line.match(headerRegex)) {
      const label = line.split('#').join('').trim();
      const id = kebabCase(label);
      const level = line.split('#').length - 1;
      // If we're at the same level (or a lower level) than the last iteration, remove parents
      while (
        parentSections.length &&
        parentSections[parentSections.length - 1].level >= level
      ) {
        parentSections.pop();
      }
      parentSections.push({ level, id });

      // parentSections now has all sections that are traversed to get to the current section.
      // We'll join all parent sections to form one unique anchor for the section to prevent us
      // from having multiple sub-sections that have the same anchor
      const nestedId = parentSections
        .filter(s => s.level <= level)
        .map(s => s.id)
        .join('-');
      // Replace the header line in the markdown with one that contains our new anchor
      // inside of [[id=xxx]]
      outputLines.push(`${line} [[id=${nestedId}]]`);
    } else {
      outputLines.push(line);
    }
  }
  return outputLines.join('\n');
};

const getAllMarkdownFiles = (contentPaths: string[]) =>
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

  articles.forEach(({ data: { category, title, position, slug, hidden } }) => {
    const navigationCategory = findOrCreateCategory(category);
    if (navigationCategory && !hidden) {
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
