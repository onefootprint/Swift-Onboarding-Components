import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const screens = [
  {
    url: '/auth/make-it-yours/bifrost-1.png',
    height: 416,
    width: 400,
    zIndex: 2,
    left: '25%',
    top: '25%',
  },
  {
    url: '/auth/make-it-yours/bifrost-2.png',
    height: 449,
    width: 400,
    left: '50%',
    top: '50%',
    zIndex: 3,
  },
  {
    url: '/auth/make-it-yours/bifrost-3.png',
    height: 416,
    width: 400,
    zIndex: 2,
    left: '75%',
    top: '75%',
  },
];

const BifrostModals = () => (
  <>
    {screens.map(({ url, height, width, left, top, zIndex }) => (
      <ImageContainer zIndex={zIndex} left={left} top={top} height={height} width={width} key={url}>
        <Image key={url} src={url} height={height} width={width} alt="" />
      </ImageContainer>
    ))}
  </>
);

const ImageContainer = styled.div<{
  zIndex: number;
  left?: string;
  top?: string;
  bottom?: string;
  right?: string;
  height: number;
  width: number;
}>`
  ${({ theme, zIndex, left, right, top, bottom, height, width }) => `
    left: ${left || 'auto'};
    top: ${top || 'auto'};
    bottom: ${bottom || 'auto'};
    right: ${right || 'auto'};
    z-index: ${zIndex};
    transform: translate(-50%, -50%) scale(${zIndex === 3 ? 0.6 : 0.5});
    position: absolute;
    height: ${height}px;
    width: ${width}px;

    img {
      box-shadow: ${theme.elevation[zIndex as keyof typeof theme.elevation]};
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default};
    }
  `}
`;

export default BifrostModals;
