import { Elevation } from '@onefootprint/design-tokens';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type Position = {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
  rotation?: string;
};

const docs = [
  {
    src: '/doc-scan/grid-cards/drivers-license.png',
    alt: 'Drivers license',
    width: 336,
    height: 212,
    position: {
      bottom: '25%',
      left: 'calc(50% - 70px)',
      zIndex: 1,
      rotation: 'rotate(100deg)',
    },
  },
  {
    src: '/doc-scan/grid-cards/green-card.png',
    alt: 'Visa',
    width: 336,
    height: 212,
    position: {
      bottom: '25%',
      left: '50%',
      zIndex: 2,
      rotation: 'rotate(100deg)',
    },
  },
  {
    src: '/doc-scan/grid-cards/passport.png',
    alt: 'Passport',
    width: 232,
    height: 348,
    position: {
      bottom: '25%',
      left: 'calc(50% + 70px)',
      zIndex: 3,
      rotation: 'rotate(10deg)',
    },
  },
];
const FlexibleAndCustomizable = () => {
  return (
    <>
      {docs.map(doc => (
        <StyledImage
          src={doc.src}
          alt={doc.alt}
          width={doc.width}
          height={doc.height}
          position={doc.position}
          key={doc.src}
        />
      ))}
    </>
  );
};

const StyledImage = styled(Image)<{ position: Position }>`
  ${({ position, theme }) =>
    css`
    position: absolute;
    top: ${position.top};
    bottom: ${position.bottom};
    left: ${position.left};
    right: ${position.right};
    z-index: ${position.zIndex};
    transform: translate(-50%, 50%) ${position.rotation};
    box-shadow: ${position.zIndex ? `${position.zIndex * 5}px ${position.zIndex * 5}px ${position.zIndex * 5}px rgba(0, 0, 0, ${0.05 * position.zIndex})` : 'none'};
    border-radius: ${theme.borderRadius.xl};
    overflow: hidden;
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: translate(-50%, calc(50% - 16px)) ${position.rotation};
      z-index: ${position.zIndex ? position.zIndex + 1 : 1};
    }
  `}
`;

export default FlexibleAndCustomizable;
