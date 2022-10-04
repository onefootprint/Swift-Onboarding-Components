import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

export type BoxProps = {
  'aria-busy'?: boolean;
  ariaLabel?: string;
  as?: BoxTag;
  children?: React.ReactNode;
  id?: string;
  testID?: string;
  sx?: SXStyleProps;
};

const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      'aria-busy': ariaBusy,
      ariaLabel,
      as = 'div',
      id,
      sx,
      children,
      testID,
    }: BoxProps,
    ref: any,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledBox
        aria-busy={ariaBusy}
        aria-label={ariaLabel}
        as={as}
        data-testid={testID}
        id={id}
        ref={ref}
        sx={sxStyles}
      >
        {children}
      </StyledBox>
    );
  },
);

const StyledBox = styled('div').attrs<{ as: BoxTag }>(({ as }) => ({
  as,
}))<{ sx: SXStyles }>`
  ${({ sx }) => css`
    ${sx}
  `}
`;

export default Box;
