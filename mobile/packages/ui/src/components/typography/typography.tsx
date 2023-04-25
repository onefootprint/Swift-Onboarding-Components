import { Color, FontVariant } from '@onefootprint/design-tokens';
import React from 'react';
import styled, { css } from '@onefootprint/styled';
import { TextProps } from 'react-native';

export type TypographyProps = {
  style?: TextProps['style'];
  center?: boolean;
  children: React.ReactNode;
  color?: Color;
  ellipsizeMode?: TextProps['ellipsizeMode'];
  numberOfLines?: number;
  variant: FontVariant;
};

const Typography = ({
  style,
  center = false,
  children,
  color = 'primary',
  ellipsizeMode,
  numberOfLines,
  variant,
}: TypographyProps) => {
  return (
    <StyledText
      style={style}
      center={center}
      color={color}
      ellipsizeMode={ellipsizeMode}
      numberOfLines={numberOfLines}
      variant={variant}
    >
      {children}
    </StyledText>
  );
};

const StyledText = styled.Text<{
  color: Color;
  variant: FontVariant;
  center: boolean;
}>`
  ${({ theme, color, variant }) => css`
    /* font: ${theme.typography[variant]}; */
    color: ${theme.color[color]};
  `}

  ${({ center }) =>
    center &&
    css`
      text-align: center;
    `}
`;

export default Typography;
