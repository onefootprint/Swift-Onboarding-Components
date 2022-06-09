import React from 'react';
import EncryptedCell from 'src/pages/users/components/encrypted-cell';
import { Typography } from 'ui';

type FieldOrPlaceholderProps = {
  value: string | undefined;
  isLoading?: boolean;
};

const FieldOrPlaceholder = ({
  value,
  isLoading = false,
}: FieldOrPlaceholderProps) =>
  value ? (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {value}
    </Typography>
  ) : (
    <EncryptedCell isLoading={isLoading} />
  );

export default FieldOrPlaceholder;
