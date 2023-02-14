import useHandoffMachine from '../use-handoff-machine';

const useSandboxMode = () => {
  const [state] = useHandoffMachine();
  const { onboardingConfig: tenant } = state.context;
  return { isSandbox: tenant?.isLive === false };
};

export default useSandboxMode;
