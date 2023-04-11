import useIdvMachine from '../use-idv-machine/use-idv-machine';

const useSandboxMode = () => {
  const [state] = useIdvMachine();
  const { config } = state.context;

  return { isSandbox: config?.isLive === false };
};

export default useSandboxMode;
