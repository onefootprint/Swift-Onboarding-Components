import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css, keyframes } from 'styled-components';

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

const Content = styled(RadixDropdown.Content).attrs({
  sideOffset: 4,
})<{
  $minWidth?: string;
  $maxWidth?: string;
  $width?: string;
}>`
    ${({ theme, $minWidth, $maxWidth, $width }) => css`
      position: relative;
      background: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius.default};
      border: 1px solid ${theme.borderColor.tertiary};
      box-shadow: ${theme.elevation[2]};
      min-width: ${$minWidth};
      max-width: ${$maxWidth};
      width: ${$width};
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
