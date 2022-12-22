import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

type BlobProps = {
  color: string;
  width: number;
  height: number;
  left: number;
  top: number;
  mixBlendMode?: string;
};

const Blob = styled.div<BlobProps>`
  ${props => css`
    position: absolute;
    top: ${props.top}%;
    left: ${props.left}%;
    height: ${props.height}%;
    width: ${props.width}%;
    background-color: ${props.color};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    filter: blur(100px);
    mix-blend-mode: ${props.mixBlendMode};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

export default Blob;
