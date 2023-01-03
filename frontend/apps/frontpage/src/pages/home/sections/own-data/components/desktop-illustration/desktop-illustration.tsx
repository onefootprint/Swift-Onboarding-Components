import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const mainImgVariants = {
  hidden: {
    opacity: 0,
    x: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 1, type: 'spring', delay: 0.8 },
  },
};

const secondaryImgVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 1, type: 'spring', delay: 0.5 },
  },
};

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.own-data-section');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <IlllustrationContainer ref={ref}>
      <motion.div
        className="main-img"
        animate={controls}
        initial="hidden"
        variants={mainImgVariants}
      >
        <Image
          src="/new-home/own-data/decrypt-data.png"
          height={430}
          width={372}
          alt={t('alt')}
        />
      </motion.div>
      <ImageContainer
        as={motion.div}
        className="secondary-img"
        animate={controls}
        initial="hidden"
        variants={secondaryImgVariants}
      >
        <Image
          src="/new-home/own-data/table.png"
          height={528}
          width={750}
          alt={t('alt')}
        />
      </ImageContainer>
    </IlllustrationContainer>
  );
};

const IlllustrationContainer = styled(BaseIllustration)`
  display: none;
  justify-content: center;
  align-items: center;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  .main-img {
    z-index: 1;
  }

  .secondary-img {
    transform: translate(0, 50%);
    z-index: 0;
    position: absolute;
    bottom: 10%;
    left: 10%;
  }
  ${media.greaterThan('md')`
    display: flex;
  `}
`;

const ImageContainer = styled.div`
  will-change: opacity, transform;
`;

export default DesktopIllustration;
