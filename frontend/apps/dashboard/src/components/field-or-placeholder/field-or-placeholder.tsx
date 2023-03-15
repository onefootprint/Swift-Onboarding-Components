import { Typography } from '@onefootprint/ui';
import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';

type FieldOrPlaceholderProps = {
  data?: string | null;
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
