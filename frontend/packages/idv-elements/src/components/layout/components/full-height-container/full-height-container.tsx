import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React, { forwardRef, HTMLAttributes } from 'react';

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
>(({ id, hasBorderRadius, children }, ref) => {
  const viewportHeight = use100vh();
  const height = viewportHeight ? `${viewportHeight}px` : '100vh';

  return (
    <Container
      id={id}
      ref={ref}
      hasBorderRadius={!!hasBorderRadius}
      height={height}
    >
      {children}
    </Container>
  );
});

const Container = styled.div<{ hasBorderRadius: boolean; height: string }>`
  ${({ theme, height }) => css`
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    background: ${theme.components.bifrost.dialog.bg};
    display: flex;
    flex-direction: column;
    margin: 0;
    overflow-y: auto;
    position: relative;

    body[data-variant='modal'] & {
      height: ${height};
      width: 100%;

      ${media.greaterThan('md')`
        height: auto;
        max-height: calc(100% - (2 * ${theme.spacing[9]}));
        width: 480px;
        margin: ${theme.spacing[9]};
        margin: 0;
      `}

      > div {
        height: 100%;
      }
    }

    body[data-variant='drawer'] & {
      width: 460px;
      height: 100vh;
      max-height: unset;
      position: fixed;
      right: 0;

      > div {
        height: 100%;
      }
    }
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
