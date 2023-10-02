export enum NameValidationError {
  SPECIAL_CHARS,
  EMPTY,
}

const validateName = (name?: string): NameValidationError | undefined => {
  const trimmedName = name?.trim();
  if (!trimmedName?.length) {
    return NameValidationError.EMPTY;
  }

  const allowedChars = /^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$/;
  const isValid = allowedChars.test(trimmedName);
  if (!isValid) {
    return NameValidationError.SPECIAL_CHARS;
  }

  return undefined;
};

export default validateName;
