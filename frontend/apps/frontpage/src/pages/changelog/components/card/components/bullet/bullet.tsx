import { IcoCheck24 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type BulletProps = {
  children: string;
};

const Bullet = ({ children }: BulletProps) => (
  <Container>
    <IconContainer>
      <IcoCheck24 color="tertiary" />
    </IconContainer>
    <Typography variant="body-1">{children}</Typography>
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
