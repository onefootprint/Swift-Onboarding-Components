import { type AccessEvent, AccessEventKind } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import DecryptUserData from './components/decrypt-user-data';
import PrincipalActor from './components/principal-actor';

const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  const { principal, insightEvent, detail } = accessEvent;
  const { kind } = detail;

  return (
    <Stack gap={2} flexWrap="wrap" width="100%" flexShrink={0}>
      <PrincipalActor principal={principal} insightEvent={insightEvent} />
      {kind === AccessEventKind.DecryptUserData && <DecryptUserData detail={detail} />}
    </Stack>
  );
};

export default Event;
