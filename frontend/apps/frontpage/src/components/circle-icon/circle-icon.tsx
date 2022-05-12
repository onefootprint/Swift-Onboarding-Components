import type { Icon as TIcon } from 'icons';
import React from 'react';
import styled, { BackgroundsColor, Color, css } from 'styled';

type CircleIconProps = {
  backgroundColor?: BackgroundsColor;
  color?: Color;
  Icon: TIcon;
};

const CircleIcon = ({
  backgroundColor = 'accent',
  color = 'quaternary',
  Icon,
}: CircleIconProps) => (
  <IconContainer backgroundColor={backgroundColor}>
    <Icon color={color} />
  </IconContainer>
);

const IconContainer = styled.div<{ backgroundColor: BackgroundsColor }>`
  ${({ theme, backgroundColor }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor[backgroundColor]};
    border-radius: ${theme.borderRadius[3]}px;
    display: flex;
    height: 40px;
    justify-content: center;
    margin-right: ${theme.spacing[3]}px;
    width: 40px;
  `}
`;

export default CircleIcon;
