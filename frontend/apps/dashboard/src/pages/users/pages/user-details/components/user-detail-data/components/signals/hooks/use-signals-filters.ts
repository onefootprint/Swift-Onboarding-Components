import omitBy from 'lodash/omitBy';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

export type QueryParams = {
  signal_severity?: string;
  signal_scope?: string;
  signal_id?: string;
  signal_note?: string;
  signal_search?: string;
};

const initialQueryParams: QueryParams = {
  signal_severity: undefined,
  signal_scope: undefined,
  signal_id: undefined,
  signal_note: undefined,
  signal_search: undefined,
};

const clean = (prevQuery: ParsedUrlQuery, newQuery: ParsedUrlQuery) =>
  omitBy({ ...prevQuery, ...newQuery }, query => !query);

const useSignalFilters = () => {
  const router = useRouter();

  const getFiltersCount = () => {
    const severity = countString(router.query.signal_severity);
    const scope = countString(router.query.signal_scope);
    return severity + scope;
  };

  const push = (newQuery: QueryParams) => {
    router.push({ query: clean(router.query, newQuery) }, undefined, {
      shallow: true,
    });
  };

  const reset = () => {
    router.push({ query: clean(router.query, initialQueryParams) }, undefined, {
      shallow: true,
    });
  };

  return {
    query: router.query as QueryParams,
    push,
    reset,
    count: getFiltersCount(),
  };
};

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

export default useSignalFilters;
