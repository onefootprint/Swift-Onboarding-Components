import { OnboardingConfigStatus } from '@onefootprint/types';
import useBaseFilters, { queryToBoolean } from 'src/hooks/use-filters';
import type { PlaybooksConfigQuery } from '../../utils/schema/schema';

const defaultQueryParams: PlaybooksConfigQuery = {
  hide_disabled: undefined,
  id: undefined,
  kind: undefined,
  page: undefined,
  search: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<PlaybooksConfigQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    hideDisabled: queryToBoolean(query.hide_disabled) ?? true,
    id: query.id,
    page: query.page ? Number.parseInt(query.page, 10) : 0,
    search: query.search,
  };
  const requestParams = {
    page: values.page,
    search: values.search,
    status: values.hideDisabled ? OnboardingConfigStatus.enabled : undefined,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;
