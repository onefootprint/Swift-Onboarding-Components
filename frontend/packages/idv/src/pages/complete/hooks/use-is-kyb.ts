import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import {
  CollectedDataOption,
  CollectedKybDataOption,
} from '@onefootprint/types';

import useIdvMachine from '../../../hooks/use-idv-machine';

const isKybCdo = (data: CollectedDataOption) =>
  Object.values(CollectedKybDataOption).includes(
    data as CollectedKybDataOption,
  );

const useIsKyb = () => {
  const [state] = useIdvMachine();
  const { tenantPk = '' } = state.context;

  const result = useGetOnboardingConfig({ tenantPk });
  const config = result.data;
  const isKyb = config?.canAccessData?.some(cdo => isKybCdo(cdo));

  return { isLoading: result.isLoading, isKyb };
};

export default useIsKyb;
