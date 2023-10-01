import type { AccessEvent } from '@onefootprint/types';
import { Stack, Typography } from '@onefootprint/ui';
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
    sx={{ marginTop: 2 }}
  >
    <FieldTagList targets={accessEvent.targets} />
    <Typography variant="body-3">
      {accessEvent.targets.length > 1 ? 'were' : 'was'} accessed by
    </Typography>
    <Typography variant="body-3">
      {accessEvent.principal || 'an automated process'}{' '}
    </Typography>
  </Stack>
);

export default SecurityLogHeader;
