const stripBase64Prefix = (image: string) =>
  image.replace(/data:.+?;base64,/i, '');

export default stripBase64Prefix;
