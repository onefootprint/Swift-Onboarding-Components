import useSessionUser from '../use-session-user';

const useSandboxMode = () => {
  const { isLive, data, setIsLive } = useSessionUser();
  const toggle = () => setIsLive(!isLive);

  return {
    isSandbox: isLive === false,
    canToggle: !data?.sandboxRestricted,
    toggle,
  };
};

export default useSandboxMode;
