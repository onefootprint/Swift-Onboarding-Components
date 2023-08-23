import useHostedMachine from 'src/hooks/use-hosted-machine';

const useIsKyb = () => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isKyb = onboardingConfig?.isKyb;

  return isKyb;
};

export default useIsKyb;
