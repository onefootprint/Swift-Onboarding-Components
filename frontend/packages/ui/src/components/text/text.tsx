import type { Color, FontVariant } from '@onefootprint/design-tokens';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import type { SXStyleProps, SXStyles } from '../../hooks/use-sx';
import useSX from '../../hooks/use-sx';
import { createFontStyles } from '../../utils/mixins';
import variantMapping from './text.constants';

type TextTag =
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

export type TextProps = {
  as?: TextTag;
  children: React.ReactNode;
  color?: Color;
  id?: string;
  sx?: SXStyleProps;
  testID?: string;
  title?: string;
  variant: FontVariant;
  isPrivate?: boolean;
};

const Typography = forwardRef<HTMLElement, TextProps>(
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
    }: TextProps,
    ref,
  ) => {
    const sxStyles = useSX(sx);
    return (
      <StyledText
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
      </StyledText>
    );
  },
);

const StyledText = styled.p<{
  $color: Color;
  sx: SXStyles;
  variant: FontVariant;
}>`
  ${({ theme, $color, variant, sx }) => css`
    ${createFontStyles(variant)}
    color: ${theme.color[$color]};
    ${sx};

    a {
      color: ${theme.components.link.color};
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
