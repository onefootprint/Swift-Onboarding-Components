import { Organization } from '@onefootprint/types';
import { useQueryClient } from '@tanstack/react-query';

import useSession from '../use-session';

const useOrgSession = () => {
  const {
    data: sessionData,
    dangerouslyCastedData: dangerouslySessionData,
    setOrg,
  } = useSession();
  const queryClient = useQueryClient();
  const data = sessionData?.org;
  const dangerouslyCastedData = dangerouslySessionData?.org;
  const isSandbox = data?.isLive === false;
  const canToggle = data?.isSandboxRestricted === false;

  const toggle = () => {
    setOrg({ isLive: !data?.isLive });
    queryClient.invalidateQueries();
  };

  const update = (newOrganization: Partial<Organization>) => {
    setOrg(newOrganization);
  };

  const sandbox = {
    canToggle,
    isSandbox,
    toggle,
    update,
  };

  return {
    dangerouslyCastedData,
    data,
    sandbox,
    update,
  };
};

export default useOrgSession;
