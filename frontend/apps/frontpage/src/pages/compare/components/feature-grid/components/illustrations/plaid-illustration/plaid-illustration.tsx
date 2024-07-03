import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const PlaidIllustration = () => {
  return (
    <Container>
      <ImageContainer>
        <Image src="/compare/vault.svg" alt="Plaid Illustration" width={1135 / 1.4} height={1360 / 1.4} />
      </ImageContainer>
    </Container>
  );
};

const ImageContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: absolute;
    top: ${theme.spacing[7]};
    left: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    box-shadow: ${theme.elevation[3]};

    img {
        object-fit: contain;
    }
  `}
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export default PlaidIllustration;
