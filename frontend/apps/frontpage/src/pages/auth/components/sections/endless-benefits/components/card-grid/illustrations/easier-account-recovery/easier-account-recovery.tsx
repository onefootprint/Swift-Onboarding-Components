import { Stack } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import IllustrationContainer from '../illustration-container';
import CloudIcon from './components/cloud-icon';

const EasierAccountRecovery = () => (
  <StyledIllustrationContainer>
    <IconContainer>
      <CloudIcon />
    </IconContainer>
    <Laptop src="/auth/grid/laptop.png" alt="Laptop" height={144} width={209} />
    <Phone src="/auth/grid/iphone.png" alt="Phone" height={194} width={94} />
  </StyledIllustrationContainer>
);

const IconContainer = styled(Stack)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  z-index: 2;
`;

const Phone = styled(Image)`
  position: absolute;
  top: 50%;
  right: -5%;
  transform: translate(0%, -50%) rotate(-35deg) scale(0.9);
`;

const Laptop = styled(Image)`
  transform: rotate(25deg);
  position: absolute;
  top: 5%;
  left: -10%;
  z-index: 1;
`;

const StyledIllustrationContainer = styled(IllustrationContainer)`
  mask: radial-gradient(
    60% 100% at 50% 50%,
    black 0%,
    black 50%,
    transparent 80%
  );
  mask-mode: alpha;
`;

export default EasierAccountRecovery;
