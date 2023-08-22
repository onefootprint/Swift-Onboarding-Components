const validateCompanySymbols = (value?: string) => {
  if (!value) {
    return false;
  }
  const parsed = value.replaceAll(' ', '').split(',');
  if (Array.isArray(parsed)) {
    return parsed.every(item => /^[A-Za-z]{3,5}$/.test(item));
  }
  return false;
};

export default validateCompanySymbols;
