const toReadableString = (camelCaseStr: string) => {
  let result = camelCaseStr
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase();
  result = result.charAt(0).toUpperCase() + result.slice(1);
  return result;
};

export default toReadableString;
