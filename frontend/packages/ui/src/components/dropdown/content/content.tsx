import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import type * as CSS from 'csstype';
import styled, { css, keyframes } from 'styled-components';
import type { ContentProps } from '../dropdown.types';

const ANIMATION_DURATION = '0.05s';

const translateIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);  
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const translateOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.96);
  }
`;

const Content = ({
  children,
  minWidth = '200px',
  maxWidth = '360px',
  width,
  sideOffset = 4,
  ...props
}: ContentProps) => {
  return (
    <Container sideOffset={sideOffset} $minWidth={minWidth} $maxWidth={maxWidth} $width={width} {...props}>
      {children}
    </Container>
  );
};

const Container = styled(RadixDropdown.Content)<
  Omit<ContentProps, 'maxWidth' | 'minWidth' | 'width'> & {
    $maxWidth?: CSS.Property.Width;
    $minWidth?: CSS.Property.Width;
    $width?: CSS.Property.Width;
  }
>`
  ${({ theme, $minWidth, $maxWidth, $width }) => css`
    position: relative;
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[2]};
    ${$minWidth && `min-width: ${$minWidth};`}
    ${$maxWidth && `max-width: ${$maxWidth};`}
    ${$width && `width: ${$width};`}
    max-height: 50vh;
    z-index: ${theme.zIndex.dropdown};
    animation-duration: ${ANIMATION_DURATION};
    transform-origin: var(--radix-dropdown-menu-content-transform-origin);
    overflow: auto;
   
    &[data-state="open"] {
      animation: ${translateIn} ${ANIMATION_DURATION} ease-out;
      animation-fill-mode: forwards;
    }
    
    &[data-state="closed"] {
      animation: ${translateOut} ${ANIMATION_DURATION} ease-in;
      animation-fill-mode: forwards;
    }
  `}
`;

export default Content;
