import type {
  BackgroundColor,
  BorderColor,
  BorderRadius,
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

const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ typography, as, testID, ...props }, ref) => {
    const { styleProps, ...allProps } = filterProps(props);
    return (
      <SB
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...allProps}
        $styleProps={styleProps}
        $typography={typography}
        as={as}
        data-testid={testID}
        ref={ref}
      />
    );
  },
);

const SB = styled.div<
  HTMLAttributes<HTMLDivElement> & {
    $styleProps: BoxStyleProps;
    $typography?: FontVariant;
  }
>`
  ${({ theme, $styleProps, $typography }) => css`
    ${$typography && createFontStyles($typography)};
    ${Object.keys($styleProps)
      .map(prop => {
        const value = $styleProps[prop as keyof BoxStyleProps];
        if (
          prop.startsWith('margin') ||
          prop.startsWith('padding') ||
          prop === 'gap' ||
          prop === 'rowGap' ||
          prop === 'columnGap'
        ) {
          return `${toKebabCase(prop)}: ${theme.spacing[value as Spacing]};`;
        }
        if (prop.startsWith('border') && prop.endsWith('Color')) {
          return `${toKebabCase(prop)}: ${
            theme.borderColor[value as BorderColor]
          };`;
        }
        if (prop.includes('Radius')) {
          return `${toKebabCase(prop)}: ${
            theme.borderRadius[value as BorderRadius]
          };`;
        }
        if (prop === 'backgroundColor') {
          return `background-color: ${
            theme.backgroundColor[value as BackgroundColor]
          };`;
        }
        if (prop === 'elevation') {
          return `box-shadow: ${theme.elevation[value as Elevation]};`;
        }
        if (value !== undefined && typeof value === 'string') {
          return `${toKebabCase(prop)}: ${value};`;
        }
        return '';
      })
      .join(' ')}
  `}
`;

export default Box;
