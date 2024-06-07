import type { Color, FontVariant } from '@onefootprint/design-tokens';
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type NavigationHeaderTitleProps = {
  title?: string;
  fontVariant?: FontVariant;
  fontColor?: Color;
};

const NavigationHeaderTitle = ({ title, fontVariant, fontColor }: NavigationHeaderTitleProps) =>
  title ? (
    <Container>
      <Text
        variant={fontVariant || 'label-2'}
        color={fontColor || 'primary'}
        textAlign="center"
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {title}
      </Text>
    </Container>
  ) : null;

const Container = styled.div`
  ${({ theme }) => css`
    flex-grow: 1;
    // Don't overlap with the button
    max-width: calc(100% - ${theme.spacing[10]});
    isolation: isolate;
    z-index: 1;
  `}
`;

export default NavigationHeaderTitle;
