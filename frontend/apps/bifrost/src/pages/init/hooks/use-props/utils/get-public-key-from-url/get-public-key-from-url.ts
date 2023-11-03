import type { ParsedUrlQuery } from 'querystring';

const getPublicKeyFromUrl = (query: ParsedUrlQuery): string | undefined => {
  const tenantPk = query.public_key;
  if (!tenantPk) {
    return undefined;
  }
  if (typeof tenantPk === 'string') {
    return tenantPk;
  }
  return tenantPk[0];
};

export default getPublicKeyFromUrl;
