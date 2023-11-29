/* eslint-disable react/jsx-props-no-spreading */
import type {
  BackgroundColor,
  BorderColor,
  BorderRadius,
  Elevation,
  Spacing,
} from '@onefootprint/design-tokens';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import styled, { css } from 'styled-components/native';

import type { BoxProps } from './box.types';
import filterStyleProps from './box.utils';

const Box = ({ children, ...props }: BoxProps) => {
  return <Container {...props}>{children}</Container>;
};

const Container = styled((props: ViewProps) => {
  const { style, ...allProps } = props;
  return <View {...allProps} style={style} />;
})<BoxProps>`
  ${({ theme, ...props }) =>
    css`
      ${props.center && 'justify-content: center; align-items: center;'}
      ${(Object.keys(filterStyleProps(props)) as Array<keyof BoxProps>)
        .map(prop => {
          if (prop.startsWith('margin') || prop.startsWith('padding')) {
            const value = props[prop] as Spacing;
            return `${prop}: ${theme.spacing[value]};`;
          } else if (prop.startsWith('border') && prop.endsWith('Color')) {
            const value = props[prop] as BorderColor;
            return `${prop}: ${theme.borderColor[value]};`;
          } else if (prop.includes('Radius')) {
            const value = props[prop] as BorderRadius;
            return `${prop}: ${theme.borderRadius[value]};`;
          } else if (prop === 'backgroundColor') {
            const value = props[prop] as BackgroundColor;
            return `background-color: ${theme.backgroundColor[value]};`;
          } else if (prop === 'elevation') {
            const value = props[prop] as Elevation;
            return `box-shadow: ${theme.elevation[value]};`;
          } else if (prop === 'gap' || prop === 'rowGap') {
            const value = props[prop] as Spacing;
            return `${prop}: ${theme.spacing[value]};`;
          } else if (prop !== 'children' && prop !== 'testID') {
            const value = props[prop];
            if (value !== undefined && typeof value === 'string') {
              return `${prop}: ${value};`;
            }
          }
          return '';
        })
        .join(' ')}
    `};
`;

export default Box;
