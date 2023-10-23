export const isClientApi = (path: string) => path.startsWith('/users/vault');

export const getId = (method: string, path: string) => {
  const elements = path.split('/').map(element => element.replace(/_/g, '-'));
  const filteredElements = elements
    .filter(
      element =>
        element !== '' && !element.startsWith('{') && !element.endsWith('}'),
    )
    .map(e => e.replace('_', '-'));
  const joinedElements = filteredElements.join('-');
  const client = isClientApi(path) ? '-client' : '';
  return `${method}-${joinedElements}${client}`;
};

const getArticles = (data: any) => {
  const paths = Object.keys(data.paths);
  const articles = paths.map(path => {
    const articlesInPath = Object.keys(data.paths[path]).map(methodEntry => {
      const method = methodEntry;
      const content = { ...data.paths[path][methodEntry] };
      const id = getId(method, path);
      return { path, method, id, content };
    });
    return articlesInPath;
  });
  const mergedArticlesObject = articles.reduce((acc: any, curr: any) => {
    curr.forEach((article: any) => {
      acc[article.id] = article.content;
      acc[article.id].path = article.path;
      acc[article.id].method = article.method;
    });
    return acc;
  }, {});

  const mergedArticlesArray = Object.keys(mergedArticlesObject).map(key => ({
    id: key,
    ...mergedArticlesObject[key],
  }));

  return mergedArticlesArray;
};

export default getArticles;
