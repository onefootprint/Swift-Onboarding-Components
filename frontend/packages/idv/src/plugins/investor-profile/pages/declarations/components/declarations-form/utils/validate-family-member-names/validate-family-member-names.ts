const validateFamilyMemberNames = (value?: string) => {
  if (!value) {
    return false;
  }
  const parsed = value.split(',').map(item => item.trim());
  return parsed.every(item => /^[A-Za-z\s]+$/.test(item) && item !== '');
};

export default validateFamilyMemberNames;
