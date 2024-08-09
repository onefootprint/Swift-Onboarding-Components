import sortBy from 'lodash/sortBy';

import type { ApiArticle } from '../../api-reference/api-reference.types';

export const isClientApi = (path: string) => path.startsWith('/users/vault');

/// Compute the ID used to form a deeplink to this API.
/// BE CAREFUL: changing this logic could break any previously sent/documented deeplinks.
export const getId = (method: string, path: string) => {
  const elements = path
    .split('/')
    .map(element => element.replace('_', '-').replace('{', '').replace('}', ''))
    .filter(element => element !== '');
  const joinedElements = elements.join('-');
  const client = isClientApi(path) ? '-client' : '';
  return `${method}-${joinedElements}${client}`;
};

export const getPath = (path: string) =>
  path
    .split('/')
    .map(element => {
      if (element.startsWith('{') && element.endsWith('}')) {
        // Some APIs include regex inside the variables - remove that
        const varName = element.replace('{', '').replace('}', '').split(':')[0];
        return `{${varName}}`;
      }
      return element;
    })
    .join('/');

/// Compute the navigation section that a given path will be in
const getSectionTitle = (entry: unknown) => {
  // @ts-expect-error: fix-me
  let sectionTitle = entry.tags[0];
  if (sectionTitle === 'ClientVaulting') {
    sectionTitle = 'Client vaulting';
  } else {
    // Split CamelCase into separate words
    sectionTitle = sectionTitle.replace(/[A-Z]/g, (l: string) => ` ${l.toLowerCase()}`).trim();
  }
  return sectionTitle;
};

const METHOD_PRIORITY = ['get', 'post', 'patch', 'delete'];
const methodPriority = (method: string) => {
  const prio = METHOD_PRIORITY.indexOf(method.toLowerCase());
  return prio !== undefined ? prio : Infinity;
};

const sectionPriority = (section: string) => section.toLowerCase().replace(' ', '-');

// TODO: FP-6527 add openapi-typescript for TS generation
const getArticles = (data: Record<string, unknown>): ApiArticle[] =>
  sortBy(
    // @ts-expect-error: fix-me
    Object.entries(data.paths).flatMap(([path, methods]) =>
      // @ts-expect-error: fix-me
      Object.entries(methods).map(([method, entry]) => ({
        // @ts-expect-error: fix-me
        ...entry,
        id: getId(method, getPath(path)),
        path: getPath(path),
        method,
        section: getSectionTitle(entry),
      })),
    ),
    a => [sectionPriority(a.section), a.path, methodPriority(a.method)],
  );

export default getArticles;
