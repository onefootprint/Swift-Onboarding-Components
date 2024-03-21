type Primitive = string | string[] | number | boolean | null | undefined | Date;
type NestedData = { [key: string]: Primitive | NestedData };

const flattenFormData = (
  data: NestedData,
  parentKey: string = '',
  result: NestedData = {},
): NestedData => {
  Object.entries(data).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (
      value instanceof Date ||
      value === null ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {
      // eslint-disable-next-line no-param-reassign
      result[newKey] = value;
    } else {
      flattenFormData(value as NestedData, newKey, result); // Cast value to NestedData as we now know it's not an array
    }
  });
  return result;
};

export default flattenFormData;
