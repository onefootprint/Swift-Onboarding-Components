import { Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { KycDataValue } from 'src/pages/users/users.types';

type FieldOrPlaceholderProps = {
  data?: KycDataValue;
};

const FieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) =>
  data === null ? (
    <EncryptedCell />
  ) : (
    <Typography
      isPrivate
      variant="body-3"
      color="primary"
      sx={{ whiteSpace: 'nowrap' }}
    >
      {data || '-'}
    </Typography>
  );

export default FieldOrPlaceholder;
