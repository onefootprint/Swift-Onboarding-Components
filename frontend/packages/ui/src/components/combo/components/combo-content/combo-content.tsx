import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import styled, { css, keyframes } from 'styled-components';

type ComboContentProps = {
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
};

const ANIMATION_DURATION = '0.05s';

const translateIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);  
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

const ComboContent = ({ children, maxWidth = '360px', maxHeight = '360px', width }: ComboContentProps) => {
  return (
    <Container $maxWidth={maxWidth} $maxHeight={maxHeight} $width={width} sideOffset={8}>
      <Command>{children}</Command>
    </Container>
  );
};

const Container = styled(Popover.Content)<{ $width?: string; $maxWidth?: string; $maxHeight?: string }>`
  ${({ theme, $width, $maxWidth, $maxHeight }) => css`
    width: ${$width};
    max-width: ${$maxWidth};
    max-height: ${$maxHeight};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    box-shadow: ${theme.elevation[2]};
    animation-duration: ${ANIMATION_DURATION};
    transform-origin: var(--radix-popover-content-transform-origin);
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

export default ComboContent;
