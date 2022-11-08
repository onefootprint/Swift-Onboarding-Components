import { IcoCheck16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type EventBodyEntryProps = {
  content: string | JSX.Element;
};

const EventBodyEntry = ({ content }: EventBodyEntryProps) => (
  <Container>
    <IcoCheck16 />
    <Typography variant="body-3" color="secondary" sx={{ marginLeft: 2 }}>
      {content}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-start;

    // Centers the svg on the first line (if it wraps around)
    align-items: baseline;
    svg {
      padding-top: ${theme.spacing[1]};
    }
  `}
`;

export default EventBodyEntry;
