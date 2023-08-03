const getCardAlias = (vaultFields?: string[]) => {
  if (!vaultFields?.length) {
    return null;
  }

  const field = vaultFields[0];
  try {
    const [, alias] = field.split('.');
    return alias;
  } catch (e) {
    console.error('Could not get parse card alias from auth token');
    return null;
  }
};

export default getCardAlias;
