import type { BackgroundColor, BorderColor, BorderRadius, Elevation, Spacing } from '@onefootprint/design-tokens';
import React from 'react';
import styled, { css } from 'styled-components/native';

import type { BoxProps, BoxStyleProps } from './box.types';
import filterProps from './box.utils';

const Box = ({ children, center, style, ...props }: BoxProps) => {
  const { styleProps, viewProps } = filterProps(props);
  return (
    <Container center={center} style={style} styleProps={styleProps} {...viewProps}>
      {children}
    </Container>
  );
};

const Container = styled.View<{
  center?: boolean;
  styleProps: BoxStyleProps;
}>`
  ${({ theme, center, styleProps }) =>
    css`
      ${center && 'justify-content: center; align-items: center;'}
      ${Object.keys(styleProps)
        .map(prop => {
          const value = styleProps[prop as keyof BoxStyleProps];
          if (prop === 'flexShrink') {
            return `flex-shrink: ${value};`;
          }
          if (prop === 'flexGrow') {
            return `flex-grow: ${value};`;
          }
          if (prop === 'flexBasis') {
            return `flex-basis: ${value};`;
          }
          if (prop === 'flex') {
            return `flex: ${value};`;
          }
          if (prop.startsWith('margin') || prop.startsWith('padding')) {
            return `${prop}: ${theme.spacing[value as Spacing]};`;
          } else if (prop.startsWith('border') && prop.endsWith('Color')) {
            return `${prop}: ${theme.borderColor[value as BorderColor]};`;
          } else if (prop.includes('Radius')) {
            return `${prop}: ${theme.borderRadius[value as BorderRadius]};`;
          } else if (prop === 'backgroundColor') {
            return `background-color: ${theme.backgroundColor[value as BackgroundColor]};`;
          } else if (prop === 'elevation') {
            return `box-shadow: ${theme.elevation[value as Elevation]};`;
          } else if (prop === 'gap' || prop === 'rowGap' || prop === 'columnGap') {
            return `${prop}: ${theme.spacing[value as Spacing]};`;
          } else {
            if (value !== undefined && typeof value === 'string') {
              return `${prop}: ${value};`;
            }
            if (value !== undefined && typeof value === 'number') {
              return `${prop}: ${value}px;`;
            }
          }
          return '';
        })
        .join(' ')}
    `};
`;

export default Box;
