import { useGetOnboardingConfig } from '@onefootprint/idv-elements';

import useIdvMachine from '../../../hooks/use-idv-machine';

const useIsKyb = () => {
  const [state] = useIdvMachine();
  const { obConfigAuth, authToken } = state.context;
  const result = useGetOnboardingConfig({ obConfigAuth, authToken });
  const config = result.data;
  const isKyb = config?.isKyb;

  return { isLoading: result.isLoading, isKyb };
};

export default useIsKyb;
