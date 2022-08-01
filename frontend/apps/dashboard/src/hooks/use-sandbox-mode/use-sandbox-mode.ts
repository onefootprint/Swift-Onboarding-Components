import useSessionUser from '../use-session-user';

const useSandboxMode = () => {
  const { isLive, setIsLive } = useSessionUser();
  const value = isLive === false;
  const toggle = () => setIsLive(!isLive);

  return [value, toggle] as const;
};

export default useSandboxMode;
