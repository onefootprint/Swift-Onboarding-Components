import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import { CodeInline, Shimmer } from 'ui';

type KeyCellProps = {
  isLoading: boolean;
  value: string | null;
};

const KeyCell = ({ value, isLoading }: KeyCellProps) => {
  if (isLoading) {
    return <Shimmer sx={{ height: '24px', width: '280px' }} />;
  }

  return value ? <CodeInline truncate>{value}</CodeInline> : <EncryptedCell />;
};

export default KeyCell;
