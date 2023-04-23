import { useGetOnboardingConfig } from '@onefootprint/idv-elements';

import useIdvMachine from '../use-idv-machine';

const useSandboxMode = () => {
  const [state] = useIdvMachine();
  const { tenantPk } = state.context;

  const result = useGetOnboardingConfig(tenantPk);
  if (result.isLoading) {
    return false;
  }
  return result.data?.isLive === false;
};

export default useSandboxMode;
