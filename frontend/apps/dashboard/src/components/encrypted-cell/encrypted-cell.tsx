import { IcoLock16 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { Grid } from '@onefootprint/ui';
import React from 'react';

type EncryptedCellProps = {
  prefix?: string;
};

const EncryptedCell = ({ prefix }: EncryptedCellProps) => (
  <Container
    templateAreas={['icon value']}
    columns={['16px', '1fr']}
    rows={['1fr']}
    alignItems="center"
    justifyContent="flex-end"
    width="fit-content"
    gap={2}
    minWidth="88px"
    as="span"
  >
    <Grid.Item gridArea="icon" align="center" justify="center" as="span">
      <IcoLock16 />
    </Grid.Item>
    <Grid.Item
      fontStyle="body-3"
      color="primary"
      gridArea="value"
      justify="right"
    >
      {`${prefix ? `${prefix}` : '••'}••••••••••`}
    </Grid.Item>
  </Container>
);

const Container = styled(Grid.Container)`
  user-select: none;
  pointer-events: none;
`;

export default EncryptedCell;
