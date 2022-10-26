import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { Property } from 'csstype';
import React from 'react';
import styled, { css } from 'styled-components';

type CircleIconProps = {
  backgroundColor?: BackgroundColor;
  color?: Color;
  iconComponent: Icon;
  size?: Property.Width<'string'>;
};

const CircleIcon = ({
  backgroundColor = 'accent',
  color = 'quaternary',
  iconComponent: Icon,
  size = '40px',
}: CircleIconProps) => (
  <IconContainer backgroundColor={backgroundColor} size={size}>
    <Icon color={color} />
  </IconContainer>
);

const IconContainer = styled.div<{
  backgroundColor: BackgroundColor;
  size: Property.Width<'string'>;
}>`
  ${({ theme, backgroundColor, size }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor[backgroundColor]};
    border-radius: ${theme.borderRadius.full}px;
    display: flex;
    height: ${size};
    justify-content: center;
    margin-right: ${theme.spacing[3]}px;
    width: ${size};
  `}
`;

export default CircleIcon;
