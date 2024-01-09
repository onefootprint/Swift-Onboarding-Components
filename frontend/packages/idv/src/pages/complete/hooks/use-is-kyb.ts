import { useGetOnboardingConfig } from '../../../hooks';
import useIdvMachine from '../../../hooks/ui/use-idv-machine';

const useIsKyb = () => {
  const [state] = useIdvMachine();
  const { obConfigAuth, authToken } = state.context;
  const result = useGetOnboardingConfig({ obConfigAuth, authToken });
  const config = result.data;
  const isKyb = config?.isKyb;

  return { isLoading: result.isLoading, isKyb };
};

export default useIsKyb;
