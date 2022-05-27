import React from 'react';
import EncryptedCell from 'src/pages/users/components/encrypted-cell';
import { Typography } from 'ui';

type FieldOrPlaceholderProps = {
  value: string | undefined;
};

const FieldOrPlaceholder = ({ value }: FieldOrPlaceholderProps) =>
  value ? (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {value}
    </Typography>
  ) : (
    <EncryptedCell />
  );

export default FieldOrPlaceholder;
