import camelCase from 'lodash/camelCase';
import isObject from 'lodash/isObject';
import snakeCase from 'lodash/snakeCase';
import transform from 'lodash/transform';

type CaseTransformed<T> =
  T extends Array<infer U>
    ? Array<CaseTransformed<U>>
    : T extends {}
      ? {
          [K in keyof T as K extends string ? string : never]: CaseTransformed<
            T[K]
          >;
        }
      : T;

const keysToCamelCase = <T extends Record<string, unknown>>(
  obj: T,
  disabled?: boolean,
): CaseTransformed<T> | T => {
  if (disabled) {
    return obj;
  }
  return transform(
    obj,
    (result: Record<string, unknown>, value: unknown, key: string) => {
      let newValue: unknown;

      if (
        isObject(value) &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        newValue = keysToCamelCase(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        newValue = value.map(item =>
          isObject(item) && !(item instanceof Date)
            ? keysToCamelCase(item as Record<string, unknown>)
            : item,
        );
      } else {
        newValue = value;
      }

      // eslint-disable-next-line no-param-reassign
      result[camelCase(key)] = newValue;
    },
    {} as Record<string, unknown>,
  ) as CaseTransformed<T>;
};

const keysToSnakeCase = <T extends Record<string, unknown>>(
  obj: T,
  disabled?: boolean,
): CaseTransformed<T> | T => {
  if (disabled) {
    return obj;
  }
  return transform(
    obj,
    (result: Record<string, unknown>, value: unknown, key: string) => {
      let newValue: unknown;

      if (
        isObject(value) &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        newValue = keysToSnakeCase(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        newValue = value.map(item =>
          isObject(item) && !(item instanceof Date)
            ? keysToSnakeCase(item as Record<string, unknown>)
            : item,
        );
      } else {
        newValue = value;
      }

      // eslint-disable-next-line no-param-reassign
      result[snakeCase(key)] = newValue;
    },
    {} as Record<string, unknown>,
  ) as CaseTransformed<T>;
};

export { keysToCamelCase, keysToSnakeCase };
