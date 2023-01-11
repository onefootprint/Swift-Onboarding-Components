import omitBy from 'lodash/omitBy';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

const useFilters = <T>(defaultQueryParams: ParsedUrlQuery) => {
  const router = useRouter();

  const push = (newQuery: T) => {
    router.push(
      { query: clean(router.query, newQuery as ParsedUrlQuery) },
      undefined,
      {
        shallow: true,
      },
    );
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

// TODO: This should be removed once we remove the old filters
export const countString = (value?: any) => {
  if (value && typeof value === 'string') {
    return value.split(',').length;
  }
  return 0;
};

export const queryToArray = (value?: string | string[]) => {
  if (!value) return [];
  if (typeof value === 'string') {
    return [value];
  }
  return value;
};

export const queryToString = (value: string[]) => {
  if (value.length === 0) {
    return undefined;
  }
  return value.join();
};

export default useFilters;
