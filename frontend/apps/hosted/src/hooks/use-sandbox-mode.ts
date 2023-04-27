import useHostedMachine from './use-hosted-machine';

const useSandboxMode = () => {
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;

  return { isSandbox: onboardingConfig?.isLive === false };
};

export default useSandboxMode;
