import { primitives } from '@onefootprint/design-tokens';
import styled, { css } from 'styled-components';

type RectangleProps = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const Rectangle = styled.div<RectangleProps>`
  ${({ left, top, height, width }) => css`
    z-index: 2;
    position: absolute;
    left: ${left}px;
    top: ${top}px;
    width: ${width}px;
    height: ${height}px;
    background: ${primitives.Gray800};
    border-radius: 5px;
  `}
`;

export default Rectangle;
