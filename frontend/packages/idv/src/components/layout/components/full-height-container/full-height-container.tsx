import type { FootprintVariant } from '@onefootprint/footprint-js';
import { media } from '@onefootprint/ui';
import type { HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import use100vh from './hooks/use-100vh';

type FullHeightContainerProps = HTMLAttributes<HTMLDivElement> & {
  variant?: FootprintVariant;
  hasBorderRadius?: boolean;
};

// In iPhones, with the recent changes to move the URL bar and buttons
// to the bottom of the browser page (as overlays), 100vh no longer
// refers to the height of the screen.
// See: https://bugs.webkit.org/show_bug.cgi?id=141832#c5
// Apple engineers replied saying 'it is a feature, not a bug'.
// This component resizes itself to the actual height of the screen.
const FullHeightContainer = forwardRef<HTMLDivElement, FullHeightContainerProps>(
  ({ variant = 'modal', id, hasBorderRadius, children }, ref) => {
    const viewportHeight = use100vh();
    const height = viewportHeight ? `${viewportHeight}px` : '100vh';

    return (
      <Container id={id} ref={ref} $hasBorderRadius={!!hasBorderRadius} height={height} data-variant={variant}>
        {children}
      </Container>
    );
  },
);

const Container = styled.div<{ $hasBorderRadius: boolean; height: string }>`
  ${({ theme, height }) => css`
    background: ${theme.components.bifrost.container.bg};
    border: ${theme.components.bifrost.container.border};
    box-shadow: ${theme.components.bifrost.container.elevation};
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    position: relative;

    &[data-scroll-lock='true'] {
      overflow-y: hidden;
    }

    &[data-variant='modal'] {
      height: ${height};
      width: 100%;

      ${media.greaterThan('md')`
        height: auto;
        max-height: min(980px, calc(100% - (2 * ${theme.spacing[9]})));
        width: ${theme.components.bifrost.container.width || '480px'};
      `}
    }

    &[data-variant='drawer'] {
      height: ${height};
      width: 100%;

      ${media.greaterThan('md')`
        width: ${theme.components.bifrost.container.width || '460px'};
        height: 100vh;
        max-height: unset;
        position: fixed;
        right: 0;
      `}
    }
  `}

  ${({ $hasBorderRadius, theme }) =>
    $hasBorderRadius &&
    css`
      ${media.greaterThan('md')`
        border-radius: ${theme.components.bifrost.container.borderRadius};
      `}
    `}
`;

export default FullHeightContainer;
