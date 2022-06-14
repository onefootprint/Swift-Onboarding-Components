import React from 'react';
import EncryptedCell from 'src/pages/users/components/encrypted-cell';
import { Typography } from 'ui';

type FieldOrPlaceholderProps = {
  value?: string | null;
  isLoading?: boolean;
};

const FieldOrPlaceholder = ({
  value,
  isLoading = false,
}: FieldOrPlaceholderProps) =>
  value === undefined ? (
    <EncryptedCell isLoading={isLoading} />
  ) : (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {value || '-'}
    </Typography>
  );

export default FieldOrPlaceholder;
