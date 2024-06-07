/* eslint-disable react/jsx-props-no-spreading */
import type {
  BackgroundColor,
  BorderColor,
  BorderRadius,
  BorderWidth,
  Color,
  Elevation,
  FontVariant,
  Spacing,
} from '@onefootprint/design-tokens';
import toKebabCase from 'lodash/kebabCase';
import type { HTMLAttributes } from 'react';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BoxProps, BoxStyleProps } from './box.types';
import { filterProps } from './box.utils';

const Box = forwardRef<HTMLDivElement, BoxProps>(({ center, typography, tag, testID, isPrivate, ...props }, ref) => {
  const { styleProps, ...allProps } = filterProps(props);

  return (
    <SB
      $center={center}
      $styleProps={styleProps}
      $typography={typography}
      as={tag}
      data-private={isPrivate ? 'true' : undefined}
      data-dd-privacy={isPrivate ? 'mask' : 'allow'}
      data-testid={testID}
      ref={ref}
      className={props.className}
      {...allProps}
    />
  );
});

const SB = styled.div<
  HTMLAttributes<HTMLDivElement> & {
    $styleProps: BoxStyleProps;
    $typography?: FontVariant;
    $center?: boolean;
  }
>`
  ${({ theme, $center, $styleProps, $typography }) => css`
    ${$typography && createFontStyles($typography)};
    ${$center && 'display: flex; justify-content: center; align-items: center;'}
    ${Object.keys($styleProps)
      .map(prop => {
        const key = toKebabCase(prop);
        const value = $styleProps[prop as keyof BoxStyleProps];

        if (
          prop.startsWith('margin') ||
          prop.startsWith('padding') ||
          prop === 'gap' ||
          prop === 'rowGap' ||
          prop === 'columnGap'
        ) {
          return `${key}: ${theme.spacing[value as Spacing]};`;
        }
        if (prop.startsWith('border') && prop.endsWith('Color')) {
          return `${key}: ${theme.borderColor[value as BorderColor]};`;
        }
        if (prop.includes('Radius')) {
          return `${key}: ${theme.borderRadius[value as BorderRadius]};`;
        }
        if (
          prop.includes('borderWidth') ||
          prop.includes('borderTopWidth') ||
          prop.includes('borderBottomWidth') ||
          prop.includes('borderLeftWidth') ||
          prop.includes('borderRightWidth')
        ) {
          return `${key}: ${theme.borderWidth[value as BorderWidth]};`;
        }

        if (prop === 'backgroundColor') {
          return `background-color: ${theme.backgroundColor[value as BackgroundColor]};`;
        }
        if (prop === 'color') {
          return `color: ${theme.color[value as Color]};`;
        }
        if (prop === 'elevation') {
          return `box-shadow: ${theme.elevation[value as Elevation]};`;
        }
        if (value != null) {
          return `${key}: ${value};`;
        }
        return '';
      })
      .join(' ')}
  `}
`;

export default Box;
