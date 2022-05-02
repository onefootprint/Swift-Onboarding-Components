import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import useXS, { XSStyleProps, XSStyles } from '../../hooks/use-xs';

type BoxTag = 'div' | 'section' | 'article' | 'aside' | 'span' | 'main';

export type BoxProps = {
  ariaLabel?: string;
  as?: BoxTag;
  children?: React.ReactNode;
  id?: string;
  testID?: string;
  xs?: XSStyleProps;
};

const Box = forwardRef(
  ({ ariaLabel, as = 'div', id, xs, children, testID }: BoxProps, ref: any) => {
    const xsStyles = useXS(xs);
    return (
      <StyledBox
        aria-label={ariaLabel}
        as={as}
        data-testid={testID}
        id={id}
        ref={ref}
        xs={xsStyles}
      >
        {children}
      </StyledBox>
    );
  },
);

const StyledBox = styled('div').attrs<{ as: BoxTag }>(({ as }) => ({
  as,
}))<{ xs: XSStyles }>`
  ${({ xs }) => css`
    ${xs}
  `}
`;

export default Box;
