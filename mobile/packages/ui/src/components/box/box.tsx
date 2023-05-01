/* eslint-disable react/jsx-props-no-spreading */
import {
  BackgroundColor,
  BorderColor,
  BorderRadius,
  Spacing,
} from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import type { TransformsStyle, ViewStyle } from 'react-native';

export type BoxProps = Omit<
  ViewStyle,
  | 'margin'
  | 'padding'
  | 'backgroundColor'
  | 'borderBottomColor'
  | 'borderColor'
  | 'borderEndColor'
  | 'borderLeftColor'
  | 'borderRightColor'
  | 'borderStartColor'
  | 'borderTopColor'
  | 'borderBottomEndRadius'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomStartRadius'
  | 'borderRadius'
  | 'borderTopEndRadius'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderTopStartRadius'
> & {
  center?: boolean;
  testID?: string;
  children?: React.ReactNode;
} & {
  gap?: Spacing;
  rowGap?: Spacing;
  margin?: Spacing;
  marginBottom?: Spacing;
  marginEnd?: Spacing;
  marginHorizontal?: Spacing;
  marginLeft?: Spacing;
  marginRight?: Spacing;
  marginStart?: Spacing;
  marginTop?: Spacing;
  marginVertical?: Spacing;
  padding?: Spacing;
  paddingBottom?: Spacing;
  paddingEnd?: Spacing;
  paddingHorizontal?: Spacing;
  paddingLeft?: Spacing;
  paddingRight?: Spacing;
  paddingStart?: Spacing;
  paddingTop?: Spacing;
  paddingVertical?: Spacing;
  backgroundColor?: BackgroundColor;
  borderBottomColor?: BorderColor;
  borderRadius?: BorderRadius;
  borderBottomEndRadius?: BorderRadius;
  borderBottomLeftRadius?: BorderRadius;
  borderBottomRightRadius?: BorderRadius;
  borderBottomStartRadius?: BorderRadius;
  borderColor?: BorderColor;
  borderEndColor?: BorderColor;
  borderLeftColor?: BorderColor;
  borderRightColor?: BorderColor;
  borderStartColor?: BorderColor;
  borderTopColor?: BorderColor;
  borderTopEndRadius?: BorderRadius;
  borderTopLeftRadius?: BorderRadius;
  borderTopRightRadius?: BorderRadius;
  borderTopStartRadius?: BorderRadius;
} & TransformsStyle;

const Box = ({ children, ...props }: BoxProps) => {
  return <Container {...props}>{children}</Container>;
};

const Container = styled.View<BoxProps>`
  ${({ theme, ...props }) =>
    css`
      ${props.center && 'justify-content: center; align-items: center;'}
      ${(Object.keys(props) as Array<keyof BoxProps>)
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
