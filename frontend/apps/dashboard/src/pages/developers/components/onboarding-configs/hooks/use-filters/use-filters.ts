import useBaseFilters from 'src/hooks/use-filters';

export type OnboardingConfigsQuery = {
  onboarding_config_id?: string;
};

const defaultQueryParams: OnboardingConfigsQuery = {
  onboarding_config_id: undefined,
};

const useFilters = () => {
  const filters = useBaseFilters<OnboardingConfigsQuery>(defaultQueryParams);
  const { query } = filters;
  const values = {
    id: query.onboarding_config_id,
  };
  const requestParams = {
    id: values.id,
  };

  return {
    ...filters,
    requestParams,
    values,
  };
};

export default useFilters;
