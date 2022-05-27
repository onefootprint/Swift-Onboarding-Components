import React, { forwardRef } from 'react';
import styled, { Color, css, FontFamily } from 'styled';

import useSX, { SXStyleProps, SXStyles } from '../../hooks/use-sx';
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
  testID?: string;
  variant: FontFamily;
  center?: boolean;
  noSelect?: boolean;
  noWrap?: boolean;
  sx?: SXStyleProps;
};

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as = 'p',
      children,
      color = 'primary',
      sx,
      testID,
      center,
      noSelect,
      noWrap,
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
        ref={ref}
        sx={sxStyles}
        center={center}
        noSelect={noSelect}
        noWrap={noWrap}
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
  center?: boolean;
  noSelect?: boolean;
  noWrap?: boolean;
  variant: FontFamily;
}>`
  ${({ theme, color, variant, sx }) => {
    const font = theme.typography[variant];
    return css`
      color: ${theme.color[color]};
      font-family: ${font?.fontFamily};
      font-size: ${font?.fontSize};
      font-weight: ${font?.fontWeight};
      line-height: ${font?.lineHeight};
      ${sx};
    `;
  }}
  ${({ center }) =>
    center &&
    css`
      text-align: center;
    `};
  ${({ noSelect }) =>
    noSelect &&
    css`
      user-select: none;
    `};
  ${({ noWrap }) =>
    noWrap &&
    css`
      white-space: nowrap;
    `};
`;

export default Typography;
