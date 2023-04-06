import { useQueryClient } from '@tanstack/react-query';

import useSession from '../use-session';

const useOrgSession = () => {
  const {
    data: sessionData,
    dangerouslyCastedData: dangerouslySessionData,
    isLive,
    setIsLive,
  } = useSession();
  const queryClient = useQueryClient();
  const dangerouslyCastedData = dangerouslySessionData.org;
  const data = sessionData.org;
  const canToggle = sessionData.org?.isSandboxRestricted === false;

  const toggle = () => {
    setIsLive(!isLive);
    queryClient.invalidateQueries();
  };

  const sandbox = {
    canToggle,
    isSandbox: !isLive,
    toggle,
  };

  return {
    dangerouslyCastedData,
    data,
    sandbox,
  };
};

export default useOrgSession;
