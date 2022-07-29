import useSessionUser from 'src/hooks/use-session-user';

const useIsSandbox = () => {
  const { isLive } = useSessionUser();
  return isLive === false;
};

export default useIsSandbox;
