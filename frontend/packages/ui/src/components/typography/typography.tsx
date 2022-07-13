import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { Color, FontVariant } from 'themes';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import variantMapping from './typography.constants';

type TypographyTag =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'div'
  | 'span';

export type TypographyProps = {
  as?: TypographyTag;
  children: React.ReactNode;
  color?: Color;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
  variant: FontVariant;
};

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as = 'p',
      children,
      color = 'primary',
      id,
      sx,
      testID,
      variant,
    }: TypographyProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledTypography
        as={as || variantMapping[variant]}
        color={color}
        data-testid={testID}
        id={id}
        ref={ref}
        sx={sxStyles}
        variant={variant}
      >
        {children}
      </StyledTypography>
    );
  },
);

const StyledTypography = styled.p<{
  color: Color;
  sx: SXStyles;
  variant: FontVariant;
}>`
  ${({ theme, color, variant, sx }) => css`
    ${createFontStyles(variant)}
    color: ${theme.color[color]};
    ${sx};
  `}
`;

export default Typography;
