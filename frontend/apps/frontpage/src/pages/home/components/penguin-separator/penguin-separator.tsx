import { media } from '@onefootprint/ui';
import Image from 'next/legacy/image';
import React from 'react';
import styled from 'styled-components';

const PenguinSeparator = () => (
  <>
    <SmallImageContainer>
      <Image
        alt="Footprint Penguin"
        height={236}
        priority
        src="/home/penguin-floating-mobile.png"
        layout="responsive"
        width={390}
      />
    </SmallImageContainer>
    <LargeImageContainer>
      <Image
        alt="Footprint Penguin"
        height={328}
        priority
        src="/home/penguin-floating-desktop.png"
        width={960}
      />
    </LargeImageContainer>
  </>
);

const SmallImageContainer = styled.div`
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

const LargeImageContainer = styled.div`
  display: none;
  ${media.greaterThan('sm')`
    display: flex;
    align-items: center;
    justify-content: center;
  `}
`;

export default PenguinSeparator;
