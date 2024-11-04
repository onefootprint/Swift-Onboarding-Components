import {
  type AccessEvent,
  AccessEventKind,
  type ActorOrganization,
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

  return (
    <Stack gap={2} flexWrap="wrap" width="100%" flexShrink={0}>
      <PrincipalActor principal={principal as ActorOrganization} insightEvent={insightEvent} />
      {kind === AccessEventKind.DecryptUserData && <DecryptUserData detail={detail as DecryptUserDataDetail} />}
      {kind === AccessEventKind.CreateOrgRole && <CreateOrgRole detail={detail as CreateOrgRoleDetail} />}
      {kind === AccessEventKind.UpdateOrgRole && <UpdateOrgRole detail={detail as UpdateOrgRoleDetail} />}
      {kind === AccessEventKind.DeactivateOrgRole && <DeactivateOrgRole detail={detail as DeactivateOrgRoleDetail} />}
    </Stack>
  );
};

export default Event;
