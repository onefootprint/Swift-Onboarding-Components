import type { AccessEvent } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';

import FieldTagList from '../field-tag-list';

type SecurityLogHeaderProps = {
  accessEvent: AccessEvent;
};

const SecurityLogHeader = ({ accessEvent }: SecurityLogHeaderProps) => (
  <Stack
    align="center"
    justify="flex-start"
    flexWrap="wrap"
    gap={2}
    marginTop={2}
  >
    <FieldTagList targets={accessEvent.targets} />
    <Text variant="body-4">
      {accessEvent.targets.length > 1 ? 'were' : 'was'} accessed by
    </Text>
    <Text variant="label-4">
      {accessEvent.principal || 'an automated process'}{' '}
    </Text>
  </Stack>
);

export default SecurityLogHeader;
