import { FootprintAppearance } from '@onefootprint/footprint-js';
import { useGetD2PStatus } from '@onefootprint/idv-elements';
import { useHandoffMachine } from 'src/components/machine-provider';

const getParsedApperance = (params: string) => {
  try {
    const parsed = JSON.parse(decodeURIComponent(params));
    return parsed;
  } catch (_) {
    console.warn(`Could not parse appearance rules. They will be ignored.`);
    return null;
  }
};

// Style params in d2p token take precendence over the ob config one
const useGetHandoffAppearance = (): FootprintAppearance | undefined => {
  const [state] = useHandoffMachine();
  const { onboardingConfig, authToken = '' } = state.context;
  const { appearance } = onboardingConfig ?? {};

  const { data } = useGetD2PStatus({
    refetchInterval: false,
    authToken,
  });

  if (data?.meta.styleParams) {
    return getParsedApperance(data?.meta.styleParams);
  }

  return appearance;
};

export default useGetHandoffAppearance;
