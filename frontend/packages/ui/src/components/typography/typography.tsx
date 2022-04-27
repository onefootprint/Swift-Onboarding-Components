import React from 'react';
import styled, { css } from 'styled-components';
import type { Typographies, Colors } from '../../config/themes/types';
import variantMapping from './typography.constants';

export type TypographyProps = {
  center?: boolean;
  children: React.ReactNode;
  color: Colors;
  ellipsis?: boolean;
  lineThrough?: boolean;
  htmlTitle?: string;
  testID?: string;
  variant: Typographies;
};

const Typography = ({
  center,
  children,
  color,
  ellipsis = false,
  lineThrough = false,
  htmlTitle,
  testID,
  variant,
}: TypographyProps) => (
  <Text
    $center={center}
    $color={color}
    $ellipsis={ellipsis}
    $lineThrough={lineThrough}
    $variant={variant}
    as={variantMapping[variant]}
    data-testid={testID}
    title={htmlTitle || undefined}
  >
    {children}
  </Text>
);

const Text = styled.div<{
  $center?: boolean;
  $color: Colors;
  $ellipsis?: boolean;
  $lineThrough?: boolean;
  $variant: Typographies;
}>`
  padding: 0;
  margin: 0;

  ${({ theme, $color, $variant }) => {
    const font = theme.typographies[$variant];

    return css`
      color: ${theme.colors[$color]};
      font-family: ${font?.fontFamily};
      font-size: ${font?.fontSize}px;
      font-weight: ${font?.fontWeight};
      line-height: ${font?.lineHeight}px;
    `;
  }}

  ${({ theme, $color, $lineThrough }) =>
    $lineThrough &&
    css`
      text-decoration-color: ${theme.colors[$color]};
      text-decoration: line-through;
    `}

  ${({ $center }) =>
    $center &&
    css`
      text-align: center;
    `}

  ${({ $ellipsis }) =>
    $ellipsis &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
`;

export default Typography;
