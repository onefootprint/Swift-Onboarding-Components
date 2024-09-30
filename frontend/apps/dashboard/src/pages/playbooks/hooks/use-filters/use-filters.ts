import { OnboardingConfigStatus } from '@onefootprint/types';
import useBaseFilters, { queryToBoolean, queryToArray, arrayToQuery } from 'src/hooks/use-filters';
import type { PlaybooksConfigQuery } from '../../utils/schema/schema';

const defaultQueryParams: PlaybooksConfigQuery = {
  hide_disabled: undefined,
  id: undefined,
  kinds: undefined,
  page: undefined,
  search: undefined,
  show_filters: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<PlaybooksConfigQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    hideDisabled: queryToBoolean(query.hide_disabled) ?? true,
    showFilters: queryToBoolean(query.show_filters) ?? false,
    id: query.id,
    page: query.page ? Number.parseInt(query.page, 10) : 0,
    search: query.search,
    kinds: queryToArray(query.kinds) || [],
  };
  const requestParams = {
    page: values.page,
    search: values.search,
    status: values.hideDisabled ? OnboardingConfigStatus.enabled : undefined,
    kinds: arrayToQuery(values.kinds),
  };

  const hasFilters = values.kinds.length > 0;

  return {
    ...filters,
    requestParams,
    values,
    hasFilters,
  };
};

export default useFilters;
