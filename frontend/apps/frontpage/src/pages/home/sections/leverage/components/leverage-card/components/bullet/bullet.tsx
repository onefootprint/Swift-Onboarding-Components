import type { Icon } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type BulletProps = {
  children: React.ReactNode;
  icon: Icon;
};

export const Bullet = ({ children, icon: Icon }: BulletProps) => (
  <Container tag="li">
    <IconContainer>
      <Icon />
    </IconContainer>
    <Text variant="body-1" color="secondary">
      {children}
    </Text>
  </Container>
);

const Container = styled(Box)`
  ${({ theme }) => css`
    gap: ${theme.spacing[4]};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  `}
`;

const IconContainer = styled(Stack)`
  flex: 0;
`;

export default Bullet;
