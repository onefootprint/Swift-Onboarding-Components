import {
  CollectedDataOption,
  CollectedKybDataOption,
} from '@onefootprint/types';
import useHostedMachine from 'src/hooks/use-hosted-machine';

const isKybCdo = (data: CollectedDataOption) =>
  Object.values(CollectedKybDataOption).includes(
    data as CollectedKybDataOption,
  );

const useIsKyb = () => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isKyb = onboardingConfig?.canAccessData?.some(cdo => isKybCdo(cdo));

  return isKyb;
};

export default useIsKyb;
