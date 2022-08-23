import React from 'react';
import { AccessEvent } from 'src/types';
import { Typography } from 'ui';

import FieldTagList from '../field-tag-list';

type SecurityLogHeaderProps = {
  accessEvent: AccessEvent;
};

const SecurityLogHeader = ({ accessEvent }: SecurityLogHeaderProps) => (
  <Typography variant="body-3">
    <FieldTagList targets={accessEvent.targets} />{' '}
    {accessEvent.targets.length > 1 ? 'were' : 'was'} accessed by{' '}
    {accessEvent.principal || 'an automated process'}
  </Typography>
);

export default SecurityLogHeader;
