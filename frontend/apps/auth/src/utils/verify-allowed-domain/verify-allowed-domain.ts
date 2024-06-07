const isLocalhost = (s: string): boolean => /https?:\/\/localhost/gi.test(s);
const isFootPrintPreview = (s: string): boolean => /https?:\/\/.*\.preview\.onefootprint\.com/gi.test(s);

const isDomain = (s: string): boolean => /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/.test(s);

const extractCleanDomain = (s: string): string => s.replace(/(https?:\/\/)?(www\.)?/gi, '').split('/')[0];

const isDomainAllowed = (url: string, list?: string[]): boolean => {
  if (!url) return false;
  if (!list || !Array.isArray(list) || list.length === 0) return true;
  if (isLocalhost(url)) return true;
  if (isFootPrintPreview(url)) return true;
  if (!isDomain(url)) return false;

  const domain = extractCleanDomain(url);

  return list.some(item => item.indexOf(domain) !== -1);
};

export default isDomainAllowed;
