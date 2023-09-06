import styled from '@onefootprint/styled';
import type { AccessEvent } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import FieldTagList from '../field-tag-list';

type SecurityLogHeaderProps = {
  accessEvent: AccessEvent;
};

const SecurityLogHeader = ({ accessEvent }: SecurityLogHeaderProps) => (
  <Container>
    <FieldTagList targets={accessEvent.targets} />{' '}
    <Typography variant="body-3" sx={{ marginLeft: 3 }}>
      {accessEvent.targets.length > 1 ? 'were' : 'was'} accessed by
    </Typography>
    <Typography variant="body-3" sx={{ marginLeft: 2 }}>
      {accessEvent.principal || 'an automated process'}{' '}
    </Typography>
  </Container>
);

const Container = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
`;

export default SecurityLogHeader;
