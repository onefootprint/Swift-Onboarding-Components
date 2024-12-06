const getAliasforListName = (listName: string = ''): string =>
  `@${listName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()}`;

export default getAliasforListName;
