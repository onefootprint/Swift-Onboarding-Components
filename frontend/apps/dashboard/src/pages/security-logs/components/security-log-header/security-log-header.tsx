import type { AccessEvent, DecryptUserDataDetail } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';

import FieldTagList from '../field-tag-list';

type SecurityLogHeaderProps = {
  accessEvent: AccessEvent;
};

const SecurityLogHeader = ({ accessEvent }: SecurityLogHeaderProps) => {
  const { data } = accessEvent.detail as DecryptUserDataDetail;
  const targets = data.decryptedFields;
  const actor = accessEvent.principal.member || accessEvent.principal.name || 'an automated process';
  return (
    <Stack align="center" justify="flex-start" flexWrap="wrap" gap={2} marginTop={2}>
      <FieldTagList targets={targets} />
      <Text variant="body-3">{targets.length > 1 ? 'were' : 'was'} accessed by</Text>
      <Text variant="label-3">{actor || 'an automated process'} </Text>
    </Stack>
  );
};

export default SecurityLogHeader;
