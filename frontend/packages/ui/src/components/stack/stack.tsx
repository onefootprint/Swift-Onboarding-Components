import type { Spacing } from '@onefootprint/design-tokens';
import type { Property } from 'csstype';
import styled, { css } from 'styled-components';

import Box from '../box';

export type StackProps = {
  gap?: Spacing;
  flexWrap?: Property.FlexWrap;
  direction?: Property.FlexDirection;
  align?: Property.AlignItems;
  justify?: Property.JustifyContent;
};

const Stack = styled(Box)<StackProps>`
  ${({
    theme,
    gap,
    direction = 'row',
    align = 'unset',
    justify = 'center',
    flexWrap = 'nowrap',
  }) => css`
    display: flex;
    gap: ${theme.spacing[gap || 0]};
    flex-direction: ${direction};
    align-items: ${align};
    justify-content: ${justify};
    flex-wrap: ${flexWrap};
  `}
`;

export default Stack;
