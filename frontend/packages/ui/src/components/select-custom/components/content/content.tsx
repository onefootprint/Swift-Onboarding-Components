import * as RadixSelect from '@radix-ui/react-select';
import type * as CSS from 'csstype';
import styled, { css, keyframes } from 'styled-components';
import ScrollButton from './scroll-button';

const ANIMATION_DURATION = '0.05s';

type ContentProps = RadixSelect.SelectContentProps & {
  maxHeight?: CSS.Property.Height;
  minHeight?: CSS.Property.Height;
  height?: CSS.Property.Height;
  minWidth?: CSS.Property.Width;
  maxWidth?: CSS.Property.Width;
  width?: CSS.Property.Width;
};

const Content = ({
  children,
  minWidth = '200px',
  maxWidth,
  width,
  minHeight,
  maxHeight,
  height,
  ...props
}: ContentProps) => {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content {...props} asChild>
        <Container
          $minWidth={minWidth}
          $maxWidth={maxWidth}
          $width={width}
          $minHeight={minHeight}
          $maxHeight={maxHeight}
          $height={height}
        >
          <ScrollButton direction="up" />
          <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
          <ScrollButton direction="down" />
        </Container>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
};

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

const Container = styled.div<{
  $maxWidth?: CSS.Property.Width;
  $minWidth?: CSS.Property.Width;
  $width?: CSS.Property.Width;
  $minHeight?: CSS.Property.Height;
  $maxHeight?: CSS.Property.Height;
  $height?: CSS.Property.Height;
}>`
  ${({ theme, $minWidth, $maxWidth, $width, $minHeight, $maxHeight, $height }) => css`
    position: relative;
    z-index: ${theme.zIndex.dropdown};
    ${$minWidth && `min-width: ${$minWidth};`}
    ${$maxWidth && `max-width: ${$maxWidth};`}
    ${$width && `width: ${$width};`}
    ${$minHeight && `min-height: ${$minHeight};`}
    ${$maxHeight && `max-height: ${$maxHeight};`}
    ${$height && `height: ${$height};`}
    border: 1px solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    overflow: auto;
    background: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[2]};
    animation-duration: ${ANIMATION_DURATION};
    transform-origin: var(--radix-select-content-transform-origin);
   
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
