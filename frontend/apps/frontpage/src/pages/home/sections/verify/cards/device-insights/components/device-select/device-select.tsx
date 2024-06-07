import { IcoLaptop16, IcoSmartphone216 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DeviceSelectProps = {
  icon: 'phone' | 'computer';
  id: string;
  $isActive: boolean;
  onClick: (id: string) => void;
  position: {
    x: string;
    y: string;
  };
};

const DeviceSelect = ({ icon = 'phone', id, $isActive, onClick, position }: DeviceSelectProps) => (
  <Container $isActive={$isActive} onClick={() => onClick(id)} align="center" justify="center" position={position}>
    <IconWrapper>
      {icon === 'phone' ? (
        <IcoSmartphone216 color={$isActive ? 'quinary' : 'primary'} />
      ) : (
        <IcoLaptop16 color={$isActive ? 'quinary' : 'primary'} />
      )}
    </IconWrapper>
  </Container>
);
const Container = styled(Stack)<{
  $isActive: boolean;
  position: { x: string; y: string };
}>`
  ${({ $isActive, theme, position }) => css`
    width: ${theme.spacing[8]};
    height: ${theme.spacing[8]};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: pointer;
    background-color: ${$isActive ? theme.backgroundColor.accent : theme.backgroundColor.primary};
    position: absolute;
    top: ${position.y};
    left: ${position.x};
    box-shadow: ${$isActive ? theme.elevation[3] : theme.elevation[2]};
    transition: all 0.1s ease-in-out;

    &:hover {
      box-shadow: ${theme.elevation[3]};
      background-color: ${!$isActive ? theme.backgroundColor.secondary : ''};
    }
  `}
`;

const IconWrapper = styled.div`
  position: absolute;
  transform: rotate(45deg);
`;

export default DeviceSelect;
