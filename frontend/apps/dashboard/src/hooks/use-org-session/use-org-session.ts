import useSession from '../use-session';

const useOrgSession = () => {
  const {
    data: sessionData,
    dangerouslyCastedData: dangerouslySessionData,
    setOrg,
  } = useSession();
  const data = sessionData?.org;
  const dangerouslyCastedData = dangerouslySessionData.org;
  const isSandbox = dangerouslyCastedData.isLive === false;
  const canToggle = dangerouslyCastedData.sandboxRestricted === false;

  const toggle = () => {
    setOrg({ isLive: !dangerouslyCastedData.isLive });
  };

  const sandbox = {
    canToggle,
    isSandbox,
    toggle,
  };

  return {
    dangerouslyCastedData,
    data,
    sandbox,
  };
};

export default useOrgSession;
