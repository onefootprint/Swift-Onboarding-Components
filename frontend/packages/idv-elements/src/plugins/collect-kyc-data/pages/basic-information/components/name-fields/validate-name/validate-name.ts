export enum NameValidationError {
  SPECIAL_CHARS,
  EMPTY,
  INVALID,
}

const validateName = (name?: string): NameValidationError | undefined => {
  if (!name?.length) {
    return NameValidationError.EMPTY;
  }

  const allowedChars = /^([A-Za-z0-9-\s,]+)$/;
  const isValid = allowedChars.test(name);
  if (!isValid) {
    return NameValidationError.SPECIAL_CHARS;
  }

  return undefined;
};

export default validateName;
