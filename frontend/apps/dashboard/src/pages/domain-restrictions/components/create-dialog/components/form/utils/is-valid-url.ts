const isValidUrl = (url: string) => {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (_e) {
    return false;
  }
};

export default isValidUrl;
