import { type AccessEvent, AccessEventKind } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import DecryptUserData from './components/decrypt-user-data';
import PrincipalActor from './components/principal-actor';
const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  const { principal, insightEvent, detail } = accessEvent;
  const { kind } = detail;

  return (
    <Stack gap={2}>
      <PrincipalActor principal={principal} insightEvent={insightEvent} />
      <Text variant="body-3" color="tertiary">
        {kind === AccessEventKind.DecryptUserData && <DecryptUserData detail={detail} />}
      </Text>
    </Stack>
  );
};

export default Event;
