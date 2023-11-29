import { IcoLock16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { Stack } from '@onefootprint/ui';
import React from 'react';

type EncryptedCellProps = {
  prefix?: string;
};

const EncryptedCell = ({ prefix }: EncryptedCellProps) => (
  <Container align="center" gap={3} width="fit-content">
    <Stack align="center">
      <IcoLock16 />
    </Stack>
    <Stack fontStyle="body-3" color="primary" as="span">
      {prefix ? (
        <Stack as="span" width="11px">
          {prefix}
        </Stack>
      ) : (
        <Stack as="span">••</Stack>
      )}
      <Stack as="span">•••••••</Stack>
    </Stack>
  </Container>
);

const Container = styled(Stack)`
  user-select: none;
  pointer-events: none;
`;

export default EncryptedCell;
