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
    x: -100,
    y: 80,
    zIndex: 1,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 80,
    zIndex: 1,
    transition: { duration: 1.5, type: 'spring', delay: 0.8 },
  },
};

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.accurate-section');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <IllustrationWrapper ref={ref}>
      <ImageWrapper
        as={motion.div}
        animate={controls}
        initial="hidden"
        variants={mainImgVariants}
        id="main-img"
      >
        <Image
          src="/new-home/accurate-section/audit-trail.png"
          height={394}
          width={520}
          alt={t('alt')}
        />
      </ImageWrapper>
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  position: relative;
  display: none;
  background-size: cover;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  ${media.greaterThan('md')`
    display: block; 
  `}
`;

const ImageWrapper = styled.div`
  will-change: opacity, transform;
`;

export default DesktopIllustration;
