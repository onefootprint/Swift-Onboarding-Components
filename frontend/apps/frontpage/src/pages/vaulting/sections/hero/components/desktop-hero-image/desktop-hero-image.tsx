import styled from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

const DesktopHeroImage = () => (
  <ImageContainer
    initial={{ opacity: 0, perspective: 200, rotateX: 45, minHeight: 430 }}
    animate={{ opacity: 1, rotateX: 0, transformOrigin: '50% 50%' }}
    transition={{ duration: 1 }}
  >
    <Image
      src="/vaulting/hero/dashboard-dark.png"
      alt="Vaulting Dashboard"
      width={988}
      height={733}
    />
  </ImageContainer>
);

const ImageContainer = styled(motion.div)`
  display: none;
  width: 100%;
  max-width: 988px;
  height: 430px;
  margin: auto;
  mask: radial-gradient(
    100% 100% at 50% 0%,
    black 0%,
    black 50%,
    transparent 100%
  );
  mask-mode: alpha;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

export default DesktopHeroImage;
