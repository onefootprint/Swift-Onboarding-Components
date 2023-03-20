import { media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Biometrics = () => (
  <ImageContainer>
    <StyledImage
      src="/compare/face-id.png"
      alt="Illustration 2"
      width={335}
      height={608}
    />
  </ImageContainer>
);

const ImageContainer = styled.div`
  user-select: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: radial-gradient(100% 100% at 0% 50%, #f3cfff 0%, transparent 60%),
    radial-gradient(100% 90% at 50% 90%, #d2f5ff 0%, transparent 100%);

  ${media.greaterThan('md')`
    overflow: visible;
    background: radial-gradient(60% 90% at 50% 90%, #d2f5ff 0%, transparent 50%),
    radial-gradient(90% 80% at 50% 40%, #f3cfff 0%, transparent 60%),
    radial-gradient(70% 80% at 50% 80%, #c8cbf9 0%, transparent 57%);
  `};
`;

const StyledImage = styled(Image)`
  object-fit: contain;
  position: absolute;
  transform: translateX(-50%);
  left: 50%;
  top: -60%;

  ${media.greaterThan('md')`
    left: 50%;
    top: 10%;
    mask: none;
  `};
`;

export default Biometrics;
