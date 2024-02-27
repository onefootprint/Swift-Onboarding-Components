import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionSubtitleProps = {
  maxWidth?: number;
  children: React.ReactNode;
};

const SectionSubtitle = ({ maxWidth, children }: SectionSubtitleProps) => (
  <Container maxWidth={maxWidth}>
    <Text variant="display-4" color="secondary" textAlign="center">
      {children}
    </Text>
  </Container>
);

const Container = styled.div<{ maxWidth?: number }>`
  ${({ maxWidth }) => css`
    max-width: ${maxWidth}px;
  `}
`;

export default SectionSubtitle;
