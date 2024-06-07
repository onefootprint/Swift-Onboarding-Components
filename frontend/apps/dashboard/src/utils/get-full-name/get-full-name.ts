const getFullName = (firstName?: string | null, middleName?: string | null, lastName?: string | null) => {
  if (firstName === undefined && middleName === undefined && lastName === undefined) {
    return undefined;
  }

  const names = [firstName, middleName, lastName].filter(name => name?.length);
  return names.length ? names.join(' ') : null;
};

export default getFullName;
