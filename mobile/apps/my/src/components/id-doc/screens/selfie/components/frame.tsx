import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';
import Reanimated from 'react-native-reanimated';

type CornerKind = 'TopLeft' | 'TopRight' | 'BottomLeft' | 'BottomRight';

const cornerKinds: CornerKind[] = [
  'TopLeft',
  'TopRight',
  'BottomLeft',
  'BottomRight',
];

const Frame = () => {
  return (
    <FrameContainer>
      <Box position="relative" width="100%" height="100%">
        {cornerKinds.map(corner => (
          <Corner kind={corner} key={corner} />
        ))}
      </Box>
    </FrameContainer>
  );
};

const FrameContainer = styled.View`
  ${({ theme }) => css`
    height: 100%;
    padding-vertical: ${theme.spacing[9]};
    position: absolute;
    width: 200px;
    z-index: 1;
  `}
`;

const Corner = styled(Reanimated.View)<{ kind: CornerKind }>`
  ${({ theme, kind }) => css`
    height: 50px;
    position: absolute;
    width: 50px;
    ${kind.includes('Top') &&
    css`
      top: 0;
      border-top-color: ${theme.borderColor.primary};
      border-top-width: ${theme.borderWidth[2]};
    `}
    ${kind.includes('Bottom') &&
    css`
      bottom: 0;
      border-bottom-color: ${theme.borderColor.primary};
      border-bottom-width: ${theme.borderWidth[2]};
    `}
    ${kind.includes('Left') &&
    css`
      left: 0;
      border-left-color: ${theme.borderColor.primary};
      border-left-width: ${theme.borderWidth[2]};
    `}
    ${kind.includes('Right') &&
    css`
      right: 0;
      border-right-color: ${theme.borderColor.primary};
      border-right-width: ${theme.borderWidth[2]};
    `}
    ${kind.includes('TopLeft') &&
    css`
      border-top-left-radius: ${theme.borderRadius.large};
    `}
    ${kind.includes('TopRight') &&
    css`
      border-top-right-radius: ${theme.borderRadius.large};
    `}
    ${kind.includes('BottomLeft') &&
    css`
      border-bottom-left-radius: ${theme.borderRadius.large};
    `}
    ${kind.includes('BottomRight') &&
    css`
      border-bottom-right-radius: ${theme.borderRadius.large};
    `}
  `}
`;

export default Frame;
