import styled, { css } from '@onefootprint/styled';
import React, { AriaRole, forwardRef } from 'react';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

export type BoxProps = {
  'aria-busy'?: boolean;
  ariaLabel?: string;
  as?: BoxTag;
  children?: React.ReactNode;
  id?: string;
  role?: AriaRole;
  sx?: SXStyleProps;
  testID?: string;
};

const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      'aria-busy': ariaBusy,
      ariaLabel,
      as = 'div',
      children,
      id,
      role,
      sx,
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
        role={role}
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
