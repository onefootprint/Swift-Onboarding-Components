export const isNumber = (value: string) => {
  const NUMERIC_REGEX = /^[0-9]+$/;
  return NUMERIC_REGEX.test(value);
};

export const getNextValue = (value: string, eventValue: string) => {
  let nextValue = eventValue;
  if (value?.length > 0) {
    if (value[0] === eventValue.charAt(0)) {
      nextValue = eventValue.charAt(1);
    } else if (value[0] === eventValue.charAt(1)) {
      nextValue = eventValue.charAt(0);
    }
  }
  return nextValue;
};
