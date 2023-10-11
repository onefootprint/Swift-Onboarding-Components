import type { Spacing } from '@onefootprint/design-tokens';
import type { Property } from 'csstype';
import styled, { css } from 'styled-components';

import type { SXStyleProps } from '../../hooks';
import Box from '../box';

export type StackProps = {
  gap?: Spacing;
  flexWrap?: Property.FlexWrap;
  direction?: Property.FlexDirection;
  align?: Property.AlignItems;
  justify?: Property.JustifyContent;
  flexGrow?: Property.FlexGrow;
  inline?: boolean;
  visibility?: Property.Visibility;
  sx?: SXStyleProps;
};

const Stack = styled(Box)<StackProps>`
  ${({
    theme,
    gap,
    visibility = 'visible',
    direction = 'row',
    align = 'unset',
    justify = 'flex-start',
    flexWrap = 'nowrap',
    flexGrow = 0,
    inline,
    sx,
  }) => css`
    sx=${sx};
    display: ${inline ? 'inline-flex' : 'flex'};
    gap: ${theme.spacing[gap || 0]};
    flex-direction: ${direction};
    align-items: ${align};
    justify-content: ${justify};
    flex-wrap: ${flexWrap};
    flex-grow: ${flexGrow};
    visibility: ${visibility};
  `}
`;

export default Stack;
