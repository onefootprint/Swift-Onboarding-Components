import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type SectionSubtitleProps = {
  maxWidth?: number;
  children: React.ReactNode;
};

const SectionSubtitle = ({ maxWidth, children }: SectionSubtitleProps) => (
  <Container maxWidth={maxWidth}>
    <Typography
      variant="display-4"
      color="secondary"
      sx={{
        textAlign: 'center',
      }}
    >
      {children}
    </Typography>
  </Container>
);

const Container = styled.div<{ maxWidth?: number }>`
  ${({ maxWidth }) => css`
    max-width: ${maxWidth}px;
  `}
`;

export default SectionSubtitle;
