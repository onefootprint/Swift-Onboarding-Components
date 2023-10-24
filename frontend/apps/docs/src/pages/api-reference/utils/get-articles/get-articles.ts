import { sortBy } from 'lodash';

import type { Article } from '../../api-reference.types';

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

/// Compute the navigation section that a given path will be in
const getSectionTitle = (path: string) => {
  const filteredElements = path
    .split('/')
    .map(p => p.replace(/_/g, ' '))
    .filter(
      element =>
        element !== '' && !element.startsWith('{') && !element.endsWith('}'),
    );
  // TODO one day pull this from the tags on the open API spec
  return isClientApi(path) ? 'users (client)' : filteredElements[0];
};

const METHOD_PRIORITY = ['get', 'post', 'patch', 'delete'];
const methodPriority = (method: string) => {
  const prio = METHOD_PRIORITY.indexOf(method.toLowerCase());
  return prio !== undefined ? prio : Infinity;
};

const sectionPriority = (section: string) =>
  section.toLowerCase().replace(' ', '-');

// TODO one day use types for open API specs instead of all this any
const getArticles = (data: any): Article[] =>
  sortBy(
    Object.entries(data.paths).flatMap(([path, methods]) =>
      Object.entries(methods as any).map(([method, entry]) => ({
        ...(entry as any),
        id: getId(method, path),
        path,
        method,
        section: getSectionTitle(path),
      })),
    ),
    a => [sectionPriority(a.section), a.path, methodPriority(a.method)],
  );

export default getArticles;
