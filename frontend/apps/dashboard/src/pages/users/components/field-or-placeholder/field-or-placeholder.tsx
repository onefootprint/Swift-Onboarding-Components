import { Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { KycDataValue } from 'src/hooks/use-user';

type FieldOrPlaceholderProps = {
  data?: KycDataValue;
};

const FieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) => {
  if (data === null) {
    return <EncryptedCell />;
  }
  return (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {data || '-'}
    </Typography>
  );
};

export default FieldOrPlaceholder;
