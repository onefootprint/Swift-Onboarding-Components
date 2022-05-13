import { Property } from 'csstype';
import type { Icon as TIcon } from 'icons';
import React from 'react';
import styled, { BackgroundsColor, Color, css } from 'styled';

type CircleIconProps = {
  backgroundColor?: BackgroundsColor;
  color?: Color;
  Icon: TIcon;
  size?: Property.Width<'string'>;
};

const CircleIcon = ({
  backgroundColor = 'accent',
  color = 'quaternary',
  Icon,
  size = '40px',
}: CircleIconProps) => (
  <IconContainer backgroundColor={backgroundColor} size={size}>
    <Icon color={color} />
  </IconContainer>
);

const IconContainer = styled.div<{
  backgroundColor: BackgroundsColor;
  size: Property.Width<'string'>;
}>`
  ${({ theme, backgroundColor, size }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor[backgroundColor]};
    border-radius: ${theme.borderRadius[3]}px;
    display: flex;
    height: ${size};
    justify-content: center;
    margin-right: ${theme.spacing[3]}px;
    width: ${size};
  `}
`;

export default CircleIcon;
