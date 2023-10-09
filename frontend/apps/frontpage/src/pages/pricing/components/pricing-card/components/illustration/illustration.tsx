import styled, { css } from '@onefootprint/styled';
import { media, Stack } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

type IllustrationProps = {
  src: string;
};

const Illustration = ({ src }: IllustrationProps) => (
  <Container direction="column" align="center" justify="center">
    <Image src={src} alt="Illustration" width={600} height={600} />
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    height: 100%;
    width: 100%;
    z-index: 1;
    isolation: isolate;
    overflow: hidden;

    img {
      width: 200px;
      height: 200px;
      object-fit: contain;
      z-index: 1;
    }

    &:after {
      content: '';
      opacity: 0.1;
      filter: blur(10px);
      position: absolute;
      z-index: 0;
      height: 100%;
      width: 100%;
      background: radial-gradient(
        50% 50% at 50% 50%,
        ${theme.backgroundColor.accent} 0%,
        transparent 100%
      );
      top: 50%;
      right: 0;

      ${media.greaterThan('sm')`
        top: 0;
        right: -50%;
      `}
    }
  `}
`;
export default Illustration;
