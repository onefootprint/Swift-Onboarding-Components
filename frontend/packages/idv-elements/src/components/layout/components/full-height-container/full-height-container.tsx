import { media } from '@onefootprint/ui';
import React, { forwardRef, HTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

import use100vh from './hooks/use-100vh';

type FullHeightContainerProps = HTMLAttributes<HTMLDivElement> & {
  hasBorderRadius?: boolean;
};

// In iPhones, with the recent changes to move the URL bar and buttons
// to the bottom of the browser page (as overlays), 100vh no longer
// refers to the height of the screen.
// See: https://bugs.webkit.org/show_bug.cgi?id=141832#c5
// Apple engineers replied saying 'it is a feature, not a bug'.
// This component resizes itself to the actual height of the screen.
const FullHeightContainer = forwardRef<
  HTMLDivElement,
  FullHeightContainerProps
>(({ hasBorderRadius, children }, ref) => {
  const viewportHeight = use100vh();
  const height = viewportHeight ? `${viewportHeight}px` : '100vh';

  return (
    <Container ref={ref} hasBorderRadius={!!hasBorderRadius} height={height}>
      {children}
    </Container>
  );
});

const Container = styled.div<{ hasBorderRadius: boolean; height: string }>`
  ${({ theme, height }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow-y: auto;
    position: relative;
    height: ${height};

    ${media.greaterThan('md')`
      height: auto;
      margin: ${theme.spacing[9]} auto ${theme.spacing[9]};
      max-height: calc(100vh - (2 * ${theme.spacing[9]}));
      max-width: 480px;
    `}
  `}

  ${({ hasBorderRadius, theme }) =>
    hasBorderRadius &&
    css`
      ${media.greaterThan('md')`
      border-radius: ${theme.components.bifrost.dialog.borderRadius};
    `}
    `}
`;

export default FullHeightContainer;
