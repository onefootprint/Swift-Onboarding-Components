const isName = (value: string): boolean => {
  const trimmedName = value?.trim();
  const allowedChars = /^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$/;
  return allowedChars.test(trimmedName);
};

export default isName;
