import useBifrostMachine from '../use-bifrost-machine';

const useIsSandbox = () => {
  const [state] = useBifrostMachine();
  const { tenant } = state.context;
  return tenant.isLive === false;
};

export default useIsSandbox;
