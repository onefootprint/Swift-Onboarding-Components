import React from 'react';
import styled, { Colors, css, Typographies } from 'styled';

import variantMapping from './typography.constants';

type TypographyTag =
  | 'p'
  | 'a'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'label'
  | 'span';

export type TypographyProps = {
  as?: TypographyTag;
  center?: boolean;
  children: React.ReactNode;
  color: Colors;
  ellipsis?: boolean;
  htmlTitle?: string;
  lineThrough?: boolean;
  testID?: string;
  variant: Typographies;
};

const Typography = styled('p').attrs<TypographyProps>(
  ({ as, id, variant, testID }) => ({
    'data-testid': testID,
    as: as || variantMapping[variant],
    id,
  }),
)<TypographyProps>`
  padding: 0;
  margin: 0;
  ${({ theme, color, variant }) => {
    const font = theme.typographies[variant];
    return css`
      color: ${theme.colors[color]};
      font-family: ${font?.fontFamily};
      font-size: ${font?.fontSize}px;
      font-weight: ${font?.fontWeight};
      line-height: ${font?.lineHeight}px;
    `;
  }}

  ${({ theme, color, lineThrough }) =>
    lineThrough &&
    css`
      text-decoration-color: ${theme.colors[color]};
      text-decoration: line-through;
    `}

  ${({ center }) =>
    center &&
    css`
      text-align: center;
    `}

  ${({ ellipsis }) =>
    ellipsis &&
    css`
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
`;

export default Typography;
