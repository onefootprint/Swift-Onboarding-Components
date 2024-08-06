import { IcoCheck24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type BulletProps = {
  children: string;
};

const Bullet = ({ children }: BulletProps) => (
  <Container>
    <IconContainer>
      <IcoCheck24 color="tertiary" />
    </IconContainer>
    <Text variant="body-1">{children}</Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing[2]};
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    margin: ${theme.spacing[1]} 0;
  `}
`;

export default Bullet;
