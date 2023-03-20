import { FootprintButton, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const BoostConversions = () => (
  <ImageContainer>
    <FootprintButton size="default" />
    <StyledImage
      src="/compare/funnel-lines.svg"
      alt="Illustration 1"
      width={924}
      height={898}
    />
  </ImageContainer>
);

const ImageContainer = styled.div`
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 240px;
  pointer-events: none;

  ${media.greaterThan('md')`
    width: 480px;
    height: 100%;
  `}

  button {
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 120%;
    background-blend-mode: multiply;
    background: radial-gradient(60% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(50% 80% at 30% 40%, #f3cfff 0%, transparent 60%),
      radial-gradient(70% 80% at 70% 40%, #e8eaff 0%, transparent 57%);

    ${media.greaterThan('md')`
      width: 120%;
      height: 100%;
      background: radial-gradient(60% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(50% 80% at 30% 40%, #f3cfff 0%, transparent 60%),
      radial-gradient(50% 80% at 40% 80%, #e8eaff 0%, transparent 57%),
      radial-gradient(60% 80% at 70% 58%, #daf7ff 0%, transparent 50%),
      radial-gradient(50% 80% at 80% 60%, #f0cefb 0%, transparent 60%),
      radial-gradient(50% 80% at 70% 20%, #dee0ff 0%, transparent 57%);
    `};
  }
`;

const StyledImage = styled(Image)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 24%;
  mix-blend-mode: soft-light;
  opacity: 0.9;
  z-index: 0;
  mask: radial-gradient(50% 90% at 50% 50%, #fff 0%, transparent 20%);

  ${media.greaterThan('sm')`
    left: 50%;
    top: 24%;
  `}

  ${media.greaterThan('md')`
    mask: radial-gradient(50% 70% at 50% 60%, #fff 0%, transparent 40%);
    left: 50%;
    top: 40%;
  `}

  ${media.greaterThan('lg')`
    mask: radial-gradient(50% 70% at 50% 60%, #fff 0%, transparent 40%);
    left: 50%;
    top: 36%;
  `}
`;

export default BoostConversions;
