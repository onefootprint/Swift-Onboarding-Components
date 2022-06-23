import React from 'react';
import EncryptedCell from 'src/pages/users/components/encrypted-cell';
import { Shimmer, Typography } from 'ui';

import { UserData } from '../../hooks/use-user-data';

type FieldOrPlaceholderProps = {
  data: UserData;
};

const FieldOrPlaceholder = ({ data }: FieldOrPlaceholderProps) => {
  if (data.isLoading) {
    return <Shimmer sx={{ width: '70px' }} />;
  }
  return data.exists && data.value === undefined ? (
    <EncryptedCell />
  ) : (
    <Typography variant="body-3" color="primary" sx={{ whiteSpace: 'nowrap' }}>
      {data.value || '-'}
    </Typography>
  );
};

export default FieldOrPlaceholder;
