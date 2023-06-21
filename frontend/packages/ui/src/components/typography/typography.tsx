import { Color, FontVariant } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import React, { forwardRef } from 'react';

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
  | 'span'
  | 'li';

export type TypographyProps = {
  as?: TypographyTag;
  children: React.ReactNode;
  color?: Color;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
  title?: string;
  variant: FontVariant;
  isPrivate?: boolean;
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
      title,
      variant,
      isPrivate,
    }: TypographyProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledTypography
        as={as || variantMapping[variant]}
        $color={color}
        data-testid={testID}
        id={id}
        ref={ref}
        sx={sxStyles}
        title={title}
        variant={variant}
        data-private={isPrivate ? 'true' : undefined}
      >
        {children}
      </StyledTypography>
    );
  },
);

const StyledTypography = styled.p<{
  $color: Color;
  sx: SXStyles;
  variant: FontVariant;
}>`
  ${({ theme, $color, variant, sx }) => css`
    ${createFontStyles(variant)}
    font-family: var(--fp-font-family-default);
    color: ${theme.color[$color]};
    ${sx};

    a {
      color: var(--fp-link-color);
      text-decoration: none;

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

export default Typography;
