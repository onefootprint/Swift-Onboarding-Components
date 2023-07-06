import styled, { css } from '@onefootprint/styled';
import React from 'react';

const DEFAULT_OUTER_RADIUS = 72;
const DEFAULT_INNER_RADIUS = 56;

type CaptureButtonProps = {
  onClick: () => void;
};

const CaptureButton = ({ onClick }: CaptureButtonProps) => (
  <RoundButton onClick={onClick} outerRadius={DEFAULT_OUTER_RADIUS}>
    <InnerCircle innerRadius={DEFAULT_INNER_RADIUS} />
  </RoundButton>
);

const RoundButton = styled.div<{
  outerRadius: number;
}>`
  ${({ theme, outerRadius }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${outerRadius}px;
    width: ${outerRadius}px;
    background-color: ${theme.backgroundColor.secondary};
    border: none;
    border-radius: 50%;
    position: absolute;
    bottom: ${theme.spacing[5]};

    &:hover {
      cursor: pointer;
    }
  `}
`;

const InnerCircle = styled.div<{
  innerRadius: number;
}>`
  ${({ theme, innerRadius }) => css`
    height: ${innerRadius}px;
    width: ${innerRadius}px;
    background-color: ${theme.backgroundColor.primary};
    border: none;
    border-radius: 50%;
    box-shadow: 0px 1px 4px 0px #0000001f;
  `}
`;

export default CaptureButton;
