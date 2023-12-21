const validateCompanySymbols = (value?: string) => {
  if (!value) {
    return false;
  }
  const parsed = value.replace(/ /g, '').split(',');
  if (Array.isArray(parsed)) {
    return parsed.every(item => /^[A-Za-z]{3,5}$/.test(item));
  }
  return false;
};

export default validateCompanySymbols;
