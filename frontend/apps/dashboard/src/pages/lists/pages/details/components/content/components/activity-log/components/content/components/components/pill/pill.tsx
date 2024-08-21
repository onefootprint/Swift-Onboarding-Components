import { Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type PillProps = {
  children: React.ReactNode;
  height?: string;
};

const Pill = ({ children, height }: PillProps) => (
  <Stack height={height} align="center">
    <Container>
      <Text variant="body-3">{children}</Text>
    </Container>
  </Stack>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    height: fit-content;
  `}
`;

export default Pill;
