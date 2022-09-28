import useBifrostMachine from '../use-bifrost-machine';

const useSandboxMode = () => {
  const [state] = useBifrostMachine();
  const { tenant } = state.context;
  return { isSandbox: !!tenant.pk && tenant.isLive === false };
};

export default useSandboxMode;
