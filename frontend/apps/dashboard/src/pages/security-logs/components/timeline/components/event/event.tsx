import type { Actor, AuditEvent, AuditEventDetail } from '@onefootprint/request-types/dashboard';

import { Stack } from '@onefootprint/ui';
import CreateOrgApiKey from './components/create-org-api-key';
import CreateOrgRole from './components/create-org-role';
import CreatePlaybook from './components/create-playbook';
import DeactivateOrgRole from './components/deactivate-org-role';
import DecryptOrgApiKey from './components/decrypt-org-api-key';
import EditPlaybook from './components/edit-playbook';
import InviteOrgMember from './components/invite-org-member';
import ManuallyReviewEntity from './components/manually-review-entity';
import PrincipalActor from './components/principal-actor';
import RemoveOrgMember from './components/remove-org-member';
import UpdateOrgApiKeyRole from './components/update-org-api-key-role';
import UpdateOrgApiKeyStatus from './components/update-org-api-key-status';
import UpdateOrgMember from './components/update-org-member';
import UpdateOrgRole from './components/update-org-role';
import UserData from './components/user-data';

const Event = ({ auditEvent }: { auditEvent: AuditEvent }) => {
  const { principal, insightEvent, detail } = auditEvent;
  const { kind } = detail;
  const hasPrincipalActor = Boolean(principal && insightEvent);

  return (
    <Stack gap={2} flexWrap="wrap" width="100%" flexShrink={0}>
      {hasPrincipalActor && <PrincipalActor principal={principal as Actor} insightEvent={insightEvent} />}
      {(kind === 'update_user_data' || kind === 'delete_user_data' || kind === 'decrypt_user_data') && (
        <UserData detail={detail as AuditEventDetail} />
      )}{' '}
      {kind === 'create_org_role' && (
        <CreateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'update_org_role' && (
        <UpdateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'deactivate_org_role' && (
        <DeactivateOrgRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'invite_org_member' && (
        <InviteOrgMember detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'update_org_member' && (
        <UpdateOrgMember detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'remove_org_member' && (
        <RemoveOrgMember detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'create_org_api_key' && (
        <CreateOrgApiKey detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'update_org_api_key_role' && (
        <UpdateOrgApiKeyRole detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'decrypt_org_api_key' && (
        <DecryptOrgApiKey detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'update_org_api_key_status' && (
        <UpdateOrgApiKeyStatus detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'create_playbook' && (
        <CreatePlaybook detail={detail as AuditEventDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === 'edit_playbook' && <EditPlaybook detail={detail as AuditEventDetail} hasPrincipalActor />}
      {kind === 'manually_review_entity' && (
        <ManuallyReviewEntity detail={detail as AuditEventDetail} hasPrincipalActor />
      )}
    </Stack>
  );
};

export default Event;
