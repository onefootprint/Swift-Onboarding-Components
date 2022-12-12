import useBifrostMachine from '../use-bifrost-machine';

const useSandboxMode = () => {
  const [state] = useBifrostMachine();
  const { tenant } = state.context;
  // When bifrost is running on my1fp, tenant will be undefined
  // It is important not to treat this case as sandbox
  return { isSandbox: tenant?.isLive === false };
};

export default useSandboxMode;
