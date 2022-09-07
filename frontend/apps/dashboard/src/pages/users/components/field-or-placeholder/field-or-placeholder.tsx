import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { Typography } from 'ui';

import { UserData } from '../../hooks/use-user-data';

type FieldOrPlaceholderProps = {
  data: UserData;
};

const FieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) =>
  data.exists && data.value === undefined ? (
    <EncryptedCell />
  ) : (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {data.value || '-'}
    </Typography>
  );

export default FieldOrPlaceholder;
