const getFullName = (firstName?: string | null, lastName?: string | null) => {
  if (firstName === undefined && lastName === undefined) {
    return undefined;
  }
  const names = [firstName, lastName].filter(name => name?.length);
  return names.length ? names.join(' ') : null;
};

export default getFullName;
