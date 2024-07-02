import { Button, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type FrontModalProps = {
  className?: string;
};

const FrontModal = ({ className }: FrontModalProps) => (
  <Container padding={5} gap={5} direction="column" className={className}>
    <Stack justify="space-between">
      <Text variant="label-3">Unknown charges</Text>
      <Text variant="label-3">$120.77</Text>
    </Stack>
    <Stack justify="end">
      <Button variant="primary" size="compact">
        Dispute
      </Button>
    </Stack>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border-radius: 8px;
    width: 270px;
  `}
`;

export default FrontModal;
