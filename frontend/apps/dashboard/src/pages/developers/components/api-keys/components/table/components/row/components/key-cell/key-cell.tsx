import React from 'react';
import EncryptedCell from 'src/components/encrypted-cell';
import styled from 'styled-components';
import { CodeInline, Shimmer } from 'ui';

type KeyCellProps = {
  isLoading: boolean;
  value: string | null;
};

const KeyCell = ({ value, isLoading }: KeyCellProps) => {
  if (isLoading) {
    return (
      <CodeContainer>
        <Shimmer sx={{ height: '24px', width: '260px' }} />
      </CodeContainer>
    );
  }

  return value ? (
    <CodeContainer>
      <CodeInline>{value}</CodeInline>
    </CodeContainer>
  ) : (
    <EncryptedCell />
  );
};

const CodeContainer = styled.div`
  button {
    width: 100%;
  }
`;

export default KeyCell;
