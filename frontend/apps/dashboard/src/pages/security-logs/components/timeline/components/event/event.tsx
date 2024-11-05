import {
  type AccessEvent,
  AccessEventKind,
  type Actor,
  type CreateOrgRoleDetail,
  type DeactivateOrgRoleDetail,
  type DecryptUserDataDetail,
  type UpdateOrgRoleDetail,
} from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import CreateOrgRole from './components/create-org-role';
import DeactivateOrgRole from './components/deactivate-org-role';
import DecryptUserData from './components/decrypt-user-data';
import PrincipalActor from './components/principal-actor';
import UpdateOrgRole from './components/update-org-role';

const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  const { principal, insightEvent, detail } = accessEvent;
  const { kind } = detail;
  const hasPrincipalActor = Boolean(principal && insightEvent);

  return (
    <Stack gap={2} flexWrap="wrap" width="100%" flexShrink={0}>
      {hasPrincipalActor && <PrincipalActor principal={principal as Actor} insightEvent={insightEvent} />}
      {kind === AccessEventKind.DecryptUserData && <DecryptUserData detail={detail as DecryptUserDataDetail} />}
      {kind === AccessEventKind.CreateOrgRole && (
        <CreateOrgRole detail={detail as CreateOrgRoleDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === AccessEventKind.UpdateOrgRole && (
        <UpdateOrgRole detail={detail as UpdateOrgRoleDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
      {kind === AccessEventKind.DeactivateOrgRole && (
        <DeactivateOrgRole detail={detail as DeactivateOrgRoleDetail} hasPrincipalActor={hasPrincipalActor} />
      )}
    </Stack>
  );
};

export default Event;
