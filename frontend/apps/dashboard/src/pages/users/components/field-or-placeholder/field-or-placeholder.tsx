import { Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { DataValue } from 'src/hooks/use-user-store';

type FieldOrPlaceholderProps = {
  data?: DataValue;
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
