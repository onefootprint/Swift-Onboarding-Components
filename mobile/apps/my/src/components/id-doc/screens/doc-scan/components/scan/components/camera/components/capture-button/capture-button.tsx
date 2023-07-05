import styled, { css } from '@onefootprint/styled';
import { Pressable } from '@onefootprint/ui';
import React, { useState } from 'react';

type CaptureButtonProps = {
  onPress?: () => void;
};

const CaptureButton = ({ onPress }: CaptureButtonProps) => {
  const [active, setActive] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
    >
      <OuterCircle>
        <InnerCircle active={active} />
      </OuterCircle>
    </Pressable>
  );
};

const OuterCircle = styled.View`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    height: 72px;
    justify-content: center;
    width: 72px;
  `}
`;

const InnerCircle = styled.View<{ active: boolean }>`
  ${({ active, theme }) => css`
    background-color: ${active
      ? theme.backgroundColor.secondary
      : theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    height: 56px;
    width: 56px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.12);
  `}
`;

export default CaptureButton;
