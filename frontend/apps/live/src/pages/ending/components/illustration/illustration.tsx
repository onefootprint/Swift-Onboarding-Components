import { FootprintButton } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

const Illustration = () => (
  <Container
    initial={{
      opacity: 0,
    }}
    animate={{
      opacity: 1,
    }}
    transition={{
      delay: 0.3,
      duration: 0.5,
    }}
  >
    <FootprintButton />
    <Lines src="/ending/lines.svg" alt="Decorative" height={698} width={924} />
  </Container>
);

const Container = styled(motion.span)`
  position: relative;
  z-index: -1;
  user-select: none;
  pointer-events: none;

  button {
    box-shadow: ${({ theme }) => theme.elevation[3]};
  }

  &::after {
    content: '';
    z-index: -1;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 0;
    left: 50%;
    width: 1200px;
    height: 1600px;
    background: radial-gradient(60% 80% at 50% 38%, #def8ff 0%, transparent 50%),
      radial-gradient(50% 60% at 50% 70%, #fcf3ff 0%, transparent 60%),
      radial-gradient(50% 60% at 46% 60%, #e8eaff 0%, transparent 57%);
    background-blend-mode: multiply;
  }
`;

const Lines = styled(Image)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 0%;
  left: 50%;
  z-index: 0;
  mask: radial-gradient(90% 90% at 50% 60%, #fff 0%, transparent 40%);
  mix-blend-mode: overlay;
`;

export default Illustration;
