import useBaseFilters from 'src/hooks/use-filters';
import type { PlaybooksConfigQuery } from '../../utils/schema/schema';

const defaultQueryParams: PlaybooksConfigQuery = {
  onboarding_config_id: undefined,
  onboarding_configs_page: undefined,
  onboarding_configs_search: undefined,
  onboarding_configs_status: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<PlaybooksConfigQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    status: query.onboarding_configs_status,
    page: query.onboarding_configs_page ? Number.parseInt(query.onboarding_configs_page, 10) : 0,
    id: query.onboarding_config_id,
    search: query.onboarding_configs_search,
  };
  const requestParams = {
    status: values.status,
    page: values.page,
    search: values.search,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;
