const getArticles = (data: any) => {
  const paths = Object.keys(data.paths);
  const articles = paths.map(path => {
    const elements = path.split('/').map(element => element.replace(/_/g, ' '));
    const filteredElements = elements.filter(
      element =>
        element !== '' && !element.startsWith('{') && !element.endsWith('}'),
    );
    const joinedEntities = filteredElements.join('-');
    const client = path.startsWith('/users/{fp_id}/vault') ? '-client' : '';
    const articlesInPath = Object.keys(data.paths[path]).map(methodEntry => {
      const method = methodEntry;
      const id = `${joinedEntities}-${method}${client}`;
      const content = { ...data.paths[path][methodEntry] };

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
