/* eslint-disable react/jsx-props-no-spreading */
import { Color, FontVariant } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import { TextProps } from 'react-native';

import { Box, BoxProps } from '../box';

export type TypographyProps = BoxProps & {
  style?: TextProps['style'];
  center?: boolean;
  children: React.ReactNode;
  color?: Color;
  ellipsizeMode?: TextProps['ellipsizeMode'];
  numberOfLines?: number;
  variant: FontVariant;
};

const Typography = ({
  center = false,
  children,
  color = 'primary',
  ellipsizeMode,
  numberOfLines,
  style,
  variant,
  ...props
}: TypographyProps) => {
  return (
    <Box {...props}>
      <StyledText
        center={center}
        color={color}
        ellipsizeMode={ellipsizeMode}
        numberOfLines={numberOfLines}
        style={style}
        variant={variant}
      >
        {children}
      </StyledText>
    </Box>
  );
};

const StyledText = styled.Text<{
  color: Color;
  variant: FontVariant;
  center: boolean;
}>`
  ${({ theme, color, variant }) => {
    return css`
      font: ${theme.typography[variant]};
      color: ${theme.color[color]};
    `;
  }}

  ${({ center }) =>
    center &&
    css`
      text-align: center;
    `}
`;

export default Typography;
