const pattern = /^\d{9}$/;

/** Matches a string of exactly 9 digits without other characters */
const isTin = (value: string): boolean => {
  return pattern.test(value);
};

export default isTin;
