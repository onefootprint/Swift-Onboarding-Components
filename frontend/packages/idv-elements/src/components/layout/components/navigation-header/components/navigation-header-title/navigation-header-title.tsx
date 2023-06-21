import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type NavigationHeaderTitleProps = {
  title?: string;
};

const NavigationHeaderTitle = ({ title }: NavigationHeaderTitleProps) =>
  title ? (
    <Container>
      <Typography
        variant="label-2"
        sx={{
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
    </Container>
  ) : null;

const Container = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    // Don't overlap with the button
    max-width: calc(100% - ${theme.spacing[10]});
  `}
`;

export default NavigationHeaderTitle;
