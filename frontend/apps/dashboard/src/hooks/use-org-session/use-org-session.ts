import { Organization } from '@onefootprint/types';

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
  const canToggle = dangerouslyCastedData.isSandboxRestricted === false;

  const toggle = () => {
    setOrg({ isLive: !dangerouslyCastedData.isLive });
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
