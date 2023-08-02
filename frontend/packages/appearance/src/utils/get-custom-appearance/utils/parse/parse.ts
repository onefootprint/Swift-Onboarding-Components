import DOMPurify from 'isomorphic-dompurify';

const parse = (params: string) => {
  const sanitizedParams = DOMPurify.sanitize(params);

  try {
    const parsed = JSON.parse(decodeURIComponent(sanitizedParams));
    return parsed;
  } catch (_) {
    console.warn(`Could not parse appearance rules. They will be ignored.`);
    return null;
  }
};

export default parse;
