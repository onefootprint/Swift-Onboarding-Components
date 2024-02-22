import { IcoCheckCircle16 } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type EventProps = {
  text: string;
};

const Event = ({ text }: EventProps) => (
  <Container justify="start" direction="row" align="center" gap={3}>
    <IcoCheckCircle16 color="tertiary" />
    <Typography variant="label-3" as="p" color="tertiary">
      {text}
    </Typography>
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    padding: ${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[2]}
      ${theme.spacing[3]};
    width: fit-content;

    p {
      white-space: nowrap;
    }
  `}
`;

export default Event;
