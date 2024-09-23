import { useQueryClient } from '@tanstack/react-query';

import useSession from '../use-session';

const useOrgSession = () => {
  const { data: sessionData, dangerouslyCastedData: dangerouslySessionData, isLive, setIsLive, logIn } = useSession();
  const queryClient = useQueryClient();
  const dangerouslyCastedData = dangerouslySessionData.org;
  const data = sessionData.org;
  const canToggle = sessionData.org?.isSandboxRestricted === false;

  const toggle = async () => {
    await setIsLive(!isLive);
    queryClient.invalidateQueries({ queryKey: ['org'] });
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
    logIn,
  };
};

export default useOrgSession;
