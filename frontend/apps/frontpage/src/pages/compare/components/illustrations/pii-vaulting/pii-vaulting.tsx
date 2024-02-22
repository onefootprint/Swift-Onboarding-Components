import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const PiiVaulting = () => (
  <ImageContainer>
    <StyledImage
      src="/compare/pii-vaulting.png"
      alt="Illustration 3"
      width={1440}
      height={1024}
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
  height: 110%;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    width: 150%;
    height: 100%;
    background: radial-gradient(
        60% 100% at 50% 90%,
        #d2f5ff 0%,
        transparent 50%
      ),
      radial-gradient(90% 100% at 50% 40%, #cfddff 0%, transparent 60%);
  }
`;

const StyledImage = styled(Image)`
  ${({ theme }) => css`
    position: absolute;
    scale: 0.6;
    transform-origin: top left;
    top: ${theme.spacing[8]};
    left: ${theme.spacing[8]};
    box-shadow: ${theme.elevation[1]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    mask: linear-gradient(180deg, #fff 45%, transparent 46%);
    mask-mode: alpha;
    background-size: cover;
    box-shadow: ${theme.elevation[1]};
  `}
`;

export default PiiVaulting;
