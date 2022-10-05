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

  const reset = () => {
    router.push({ query: clean(router.query, defaultQueryParams) }, undefined, {
      shallow: true,
    });
  };

  return {
    query: router.query as T,
    push,
    reset,
  };
};

const clean = (prevQuery: ParsedUrlQuery, newQuery: ParsedUrlQuery) =>
  omitBy({ ...prevQuery, ...newQuery }, query => !query);

export const stringToArray = (value?: string) => {
  if (!value) return [];
  return value.split(',');
};

export const countString = (value?: any) => {
  if (value && typeof value === 'string') {
    return value.split(',').length;
  }
  return 0;
};

export default useFilters;
