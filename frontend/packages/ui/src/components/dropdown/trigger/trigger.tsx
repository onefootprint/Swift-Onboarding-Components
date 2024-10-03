import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import type * as CSS from 'csstype';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import type { TriggerProps } from '../dropdown.types';

const Trigger = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, width, height, maxWidth, minWidth, ...props }, ref) => {
    return (
      <Container {...props} ref={ref} $width={width} $maxWidth={maxWidth} $minWidth={minWidth}>
        {children}
      </Container>
    );
  },
);

const Container = styled(RadixDropdown.Trigger)<{
  $width?: CSS.Property.Width;
  $maxWidth?: CSS.Property.Width;
  $minWidth?: CSS.Property.Width;
}>`
  ${({ $width, $maxWidth, $minWidth }) => css`
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    ${$width && `width: ${$width}`};
    ${$maxWidth && `max-width: ${$maxWidth}`};
    ${$minWidth && `min-width: ${$minWidth}`};
  `}
`;

export default Trigger;
