import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled from 'styled-components';

const mainImgVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    y: 0,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 1.5, type: 'spring', delay: 0.5 },
  },
};

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.identity-wallet');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <IllustrationContainer ref={ref}>
      <ImageContainer
        as={motion.div}
        id="main-img"
        animate={controls}
        initial="hidden"
        variants={mainImgVariants}
      >
        <Image
          src="/home/id-wallet/id-wallet.png"
          height={740}
          width={1020}
          alt={t('alt')}
        />
      </ImageContainer>
    </IllustrationContainer>
  );
};

const IllustrationContainer = styled(BaseIllustration)`
  position: relative;
  display: none;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  #main-img {
    position: absolute;
    top: -20%;
    left: 10%;
    z-index: 1;
  }

  ${media.greaterThan('md')`
    display: block;
  `}
`;

const ImageContainer = styled.div`
  will-change: transform, opacity;
`;

export default DesktopIllustration;
