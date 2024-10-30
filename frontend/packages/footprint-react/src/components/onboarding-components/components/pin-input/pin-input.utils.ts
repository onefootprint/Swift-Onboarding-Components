export const isNumber = (value: string) => {
  const NUMERIC_REGEX = /^[0-9]+$/;
  return NUMERIC_REGEX.test(value);
};

export const getNextValue = (currentValue: string, eventValues: string): string => {
  if (eventValues.length === 1) {
    return eventValues;
  }

  let output = eventValues;
  if (currentValue?.length > 0) {
    if (currentValue[0] === eventValues.charAt(0)) {
      output = eventValues.charAt(1);
    } else if (currentValue[0] === eventValues.charAt(1)) {
      output = eventValues.charAt(0);
    }
  }

  return output;
};
