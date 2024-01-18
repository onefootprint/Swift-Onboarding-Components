const getWindowUrl = (): string =>
  typeof window !== 'undefined'
    ? window.location?.href || window.location.toString()
    : '';

export default getWindowUrl;
