import type { ParsedUrlQuery } from 'querystring';
import identity from 'lodash/identity';
import omitBy from 'lodash/omitBy';
import pickBy from 'lodash/pickBy';
import { useRouter } from 'next/router';

const useFilters = <T>(defaultQueryParams: ParsedUrlQuery) => {
  const router = useRouter();

  const push = (newQuery: T) => {
    const query = clean(router.query, newQuery as ParsedUrlQuery);
    router.push({ query }, undefined, {
      shallow: true,
    });
  };

  const clear = () => {
    router.push({ query: clean(router.query, defaultQueryParams) }, undefined, {
      shallow: true,
    });
  };

  return {
    isReady: router.isReady,
    query: router.query as T,
    push,
    clear,
  };
};

const clean = (prevQuery: ParsedUrlQuery, newQuery: ParsedUrlQuery) =>
  omitBy({ ...prevQuery, ...newQuery }, query => !query);

export const stringToArray = (value?: string) => {
  if (!value) return [];
  return value.split(',');
};

export const arrayToQuery = (value?: string[] | string): string | undefined => {
  if (!value) return undefined;
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    return value.join(',');
  }
  return value;
};

export const queryToArray = (value?: string | string[]) => {
  if (!value) return [];
  if (typeof value === 'string') {
    if (value.includes(',')) {
      return value.split(',');
    }
    return [value];
  }
  return value;
};

export const queryToBoolean = (value?: string) => {
  if (!value) return undefined;
  return value === 'true';
};

export const queryToString = (value: string[]) => {
  if (value.length === 0) {
    return undefined;
  }
  return value.join();
};

export const getSearchParams = (query: ParsedUrlQuery) => {
  const queryWithoutUndefined = pickBy(query, identity) as Record<string, string>;
  return new URLSearchParams(queryWithoutUndefined).toString();
};

export default useFilters;
