import type { Actor, AuditEvent, AuditEventDetail } from '@onefootprint/request-types/dashboard';

import { Stack } from '@onefootprint/ui';
import CreateOrgRole from './components/create-org-role';
import DeactivateOrgRole from './components/deactivate-org-role';
import DecryptUserData from './components/decrypt-user-data';
import PrincipalActor from './components/principal-actor';
import UpdateOrgRole from './components/update-org-role';

const Event = ({ auditEvent }: { auditEvent: AuditEvent }) => {
  const { principal, insightEvent, detail } = auditEvent;
  const { kind } = detail;
  const hasPrincipalActor = Boolean(principal && insightEvent);

  return (
    <Stack gap={2} flexWrap="wrap" width="100%" flexShrink={0}>
      {hasPrincipalActor && <PrincipalActor principal={principal as Actor} insightEvent={insightEvent} />}
      {kind === 'decrypt_user_data' && <DecryptUserData detail={detail as AuditEventDetail} />}
      {kind === 'create_org_role' && (
        <CreateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'update_org_role' && (
        <UpdateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'deactivate_org_role' && (
        <DeactivateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
    </Stack>
  );
};

export default Event;
