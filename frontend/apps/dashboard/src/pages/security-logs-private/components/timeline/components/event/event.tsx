import type { AccessEvent } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import PrincipalActor from './components/principal-actor';

const Event = ({ accessEvent }: { accessEvent: AccessEvent }) => {
  const { principal, insightEvent } = accessEvent;
  return (
    <Stack gap={2}>
      <PrincipalActor principal={principal} insightEvent={insightEvent} />
      <Text variant="body-3" color="tertiary">
        (josh@acmebank.com) created a new
      </Text>
      <LinkButton href={`/security-logs/${accessEvent.id}`}>Playbook</LinkButton>
    </Stack>
  );
};

export default Event;
