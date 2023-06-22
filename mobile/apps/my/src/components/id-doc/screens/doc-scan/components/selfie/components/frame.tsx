import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';
import Reanimated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

type CornerKind = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

const cornerKinds: CornerKind[] = [
  'TopLeft',
  'TopRight',
  'BottomLeft',
  'BottomRight',
];

type FrameProps = {
  detector: any;
};

const Frame = ({ detector }: FrameProps) => {
  return (
    <FrameContainer>
      <Box position="relative" width="100%" height="100%">
        {cornerKinds.map(corner => (
          <Corner kind={corner} key={corner} detector={detector} />
        ))}
      </Box>
    </FrameContainer>
  );
};

const Corner = ({ kind, detector }: { kind: CornerKind; detector: any }) => {
  const borderStyle = useAnimatedStyle(() => {
    const base = detector.value ? 6 : 3;
    const borderWidths = {
      borderTopWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
      borderRightWidth: 0,
    };

    if (kind.includes('Top')) {
      borderWidths.borderTopWidth = withTiming(base, { duration: 200 });
    }
    if (kind.includes('Bottom')) {
      borderWidths.borderBottomWidth = withTiming(base, { duration: 200 });
    }
    if (kind.includes('Left')) {
      borderWidths.borderLeftWidth = withTiming(base, { duration: 200 });
    }
    if (kind.includes('Right')) {
      borderWidths.borderRightWidth = withTiming(base, { duration: 200 });
    }

    return {
      ...borderWidths,
    };
  }, [detector.value]);

  return <StyledCorner kind={kind} style={borderStyle} />;
};

const FrameContainer = styled.View`
  ${({ theme }) => css`
    height: 320px;
    padding-vertical: ${theme.spacing[9]};
    position: absolute;
    width: 260px;
    z-index: 1;
  `}
`;

const StyledCorner = styled(Reanimated.View)<{ kind: CornerKind }>`
  ${({ theme, kind }) => css`
    height: 50px;
    position: absolute;
    width: 50px;
    border-color: #fff;

    ${kind.includes('TopLeft') &&
    css`
      border-top-left-radius: ${theme.borderRadius.large};
      top: 0;
      left: 0;
    `}
    ${kind.includes('TopRight') &&
    css`
      border-top-right-radius: ${theme.borderRadius.large};
      top: 0;
      right: 0;
    `}
      ${kind.includes('BottomLeft') &&
    css`
      border-bottom-left-radius: ${theme.borderRadius.large};
      bottom: 0;
      left: 0;
    `}
      ${kind.includes('BottomRight') &&
    css`
      border-bottom-right-radius: ${theme.borderRadius.large};
      bottom: 0;
      right: 0;
    `};
  `}
`;

export default Frame;
