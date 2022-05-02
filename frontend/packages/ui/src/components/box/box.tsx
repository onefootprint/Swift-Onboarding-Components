import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

export type BoxProps = {
  ariaLabel?: string;
  as?: BoxTag;
  children?: React.ReactNode;
  id?: string;
  testID?: string;
  sx?: SXStyleProps;
};

const Box = forwardRef(
  ({ ariaLabel, as = 'div', id, sx, children, testID }: BoxProps, ref: any) => {
    const sxStyles = useSX(sx);
    return (
      <StyledBox
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
