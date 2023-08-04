import URL from 'url-parse';

export const getQueryParams = (url: string) => {
  const parsed = new URL(url, true);
  Object.keys(parsed.query).forEach((key: string) => {
    parsed.query[key] = decodeURIComponent(parsed.query[key]!);
  });

  return parsed.query;
};

export default { getQueryParams };
