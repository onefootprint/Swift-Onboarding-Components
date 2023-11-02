import styled, { css } from '@onefootprint/styled';
import { Pressable } from '@onefootprint/ui';
import React from 'react';
import Reanimated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type CaptureButtonProps = {
  onPress?: () => void;
  selected?: boolean;
};

const CaptureButton = ({ onPress, selected }: CaptureButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const size = withTiming(selected ? 24 : 56, { duration: 250 });
    return {
      borderRadius: withTiming(selected ? 4 : 100, { duration: 250 }),
      height: size,
      width: size,
    };
  });

  return (
    <Pressable onPress={onPress}>
      <OuterCircle>
        <AnimatedInnerCircle style={animatedStyle} />
      </OuterCircle>
    </Pressable>
  );
};

const OuterCircle = styled.View`
  ${({ theme }) => css`
    align-items: center;
    border: 6px solid ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.full};
    height: 72px;
    justify-content: center;
    width: 72px;
  `}
`;

const AnimatedInnerCircle = styled(Reanimated.View)<{ active: boolean }>`
  ${({ active, theme }) => css`
    background-color: ${active
      ? theme.backgroundColor.secondary
      : theme.backgroundColor.primary};
    height: 56px;
    width: 56px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, ${active ? 0 : 0.12});
  `}
`;

export default CaptureButton;
