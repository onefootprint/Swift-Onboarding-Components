import omitBy from 'lodash/omitBy';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

export type QueryParams = {
  risk_signal_id?: string;
  risk_signal_note?: string;
};

const initialQueryParams: QueryParams = {
  risk_signal_id: undefined,
  risk_signal_note: undefined,
};

const clean = (prevQuery: ParsedUrlQuery, newQuery: ParsedUrlQuery) =>
  omitBy({ ...prevQuery, ...newQuery }, query => !query);

const useFilters = () => {
  const router = useRouter();

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

  return { filters: router.query as QueryParams, push, reset };
};

export default useFilters;
