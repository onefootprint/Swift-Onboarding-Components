const isAddressLine = (str: string): boolean => {
  const trimmedStr = str?.trim();
  const addressLine1Regex = /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i;
  return !trimmedStr ? false : addressLine1Regex.test(trimmedStr);
};

export default isAddressLine;
