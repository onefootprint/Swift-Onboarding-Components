import type { AccessRequest } from '@onefootprint/request-types/dashboard';
import { isAfter, parseISO } from 'date-fns';
import { RISK_OPS_TEAM_MEMBERS } from 'src/config/constants';

type UseCanEnableEditModeProps = {
  accessRequests: AccessRequest[] | undefined;
  userEmail?: string;
  orgId?: string;
};

const useCanEnableEditMode = ({ accessRequests, userEmail, orgId }: UseCanEnableEditModeProps) => {
  const canEnableEditMode =
    (Array.isArray(accessRequests) &&
      accessRequests
        .filter((accessRequest: AccessRequest) => accessRequest.approved)
        .some(
          (accessRequest: AccessRequest) =>
            accessRequest.requester === userEmail &&
            accessRequest.tenantId === orgId &&
            isAfter(parseISO(accessRequest.expiresAt), new Date()),
        )) ||
    RISK_OPS_TEAM_MEMBERS.includes(userEmail ?? '');

  return { canEnableEditMode };
};

export default useCanEnableEditMode;
