import { IcoLock16 } from '@onefootprint/icons';
import { Grid } from '@onefootprint/ui';
import styled from 'styled-components';

type EncryptedCellProps = {
  prefix?: string;
};

const EncryptedCell = ({ prefix }: EncryptedCellProps) => (
  <Container
    alignItems="center"
    columns={['16px', '1fr']}
    gap={2}
    justifyContent="flex-end"
    minWidth="88px"
    rows={['1fr']}
    templateAreas={['icon value']}
    width="fit-content"
  >
    <Grid.Item gridArea="icon" center>
      <IcoLock16 />
    </Grid.Item>
    <Grid.Item fontStyle="body-3" color="primary" gridArea="value" justify="right">
      {`${prefix ? `${prefix}` : '••'}••••••••••`}
    </Grid.Item>
  </Container>
);

const Container = styled(Grid.Container)`
  user-select: none;
  pointer-events: none;
`;

export default EncryptedCell;
