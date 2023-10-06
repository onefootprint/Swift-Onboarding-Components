import { IcoLock16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const NitroLock = () => (
  <Container>
    <IcoBounds align="center" justify="center">
      <IcoLock16 color="quaternary" />
    </IcoBounds>
    <Typography
      variant="caption-1"
      color="quaternary"
      as="p"
      sx={{
        marginLeft: 2,
      }}
    >
      Nitro Enclave
    </Typography>
  </Container>
);

const Container = styled.li`
  display: flex;
  align-items: center;
  user-select: none;

  svg {
    transform: scale(0.65);
  }
`;

const IcoBounds = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.senary};
    width: ${theme.spacing[5]};
    height: ${theme.spacing[5]};
  `}
`;

export default NitroLock;
