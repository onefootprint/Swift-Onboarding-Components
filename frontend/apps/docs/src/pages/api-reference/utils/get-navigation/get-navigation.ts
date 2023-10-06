const getNavigation = (data: any) => {
  const paths = Object.keys(data.paths);
  const navigationElements = paths.map(path => {
    const elements = path.split('/').map(element => element.replace(/_/g, ' '));
    const filteredElements = elements.filter(
      element =>
        element !== '' && !element.startsWith('{') && !element.endsWith('}'),
    );
    const entities = filteredElements.join(' ');
    const title = filteredElements[0];
    const methods = Object.keys(data.paths[path]);
    const joinedEntities = filteredElements.join('-');
    const client = path.startsWith('/users/{fp_id}/vault') ? '-client' : '';
    const subsections = methods.map(method => ({
      method,
      entities,
      path,
      id: `${joinedEntities}-${method}${client}`,
      slug: `#${joinedEntities}-${method}${client}`,
    }));

    return {
      title,
      subsections,
    };
  });
  const combinedNavigationElements = navigationElements.reduce(
    (acc: any, curr: any) => {
      const existingElement = acc.find(
        (element: any) => element.title === curr.title,
      );

      if (existingElement) {
        existingElement.subsections.push(...curr.subsections);
      } else {
        acc.push(curr);
      }

      return acc;
    },
    [],
  );
  return combinedNavigationElements;
};

export default getNavigation;
