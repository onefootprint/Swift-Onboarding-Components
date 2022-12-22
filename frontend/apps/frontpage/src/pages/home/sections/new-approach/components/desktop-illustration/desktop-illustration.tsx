import { useTranslation } from '@onefootprint/hooks';
import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import BaseIllustration from '../../../../components/base-illustration';

const codeImgVariants = {
  hidden: {
    opacity: 0,
    x: 0,
    y: 500,
    rotate: -45,
    zIndex: 1,
  },
  visible: {
    opacity: 1,
    x: 50,
    y: 350,
    rotate: 0,
    zIndex: 1,
    transition: { duration: 0.8, type: 'spring', delay: 0.8 },
  },
};

const phoneImgVariants = {
  hidden: {
    opacity: 0,
    x: 300,
    y: 400,
    zIndex: 2,
  },
  visible: {
    opacity: 1,
    x: 300,
    y: 100,
    zIndex: 2,
    rotate: 0,
    transition: { duration: 0.8, type: 'spring' },
  },
};

const DesktopIllustration = () => {
  const { t } = useTranslation('pages.home.new-approach-section');
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
      <motion.div
        animate={controls}
        initial="hidden"
        variants={phoneImgVariants}
        className="phone-image"
      >
        <Image
          src="/new-home/new-approach-illu/phone.png"
          height={760}
          width={370}
          alt={t('features.alt')}
          priority
        />
      </motion.div>

      <motion.div
        animate={controls}
        initial="hidden"
        variants={codeImgVariants}
        className="code-image"
      >
        <Image
          src="/new-home/new-approach-illu/code.png"
          height={255}
          width={480}
          alt={t('features.alt')}
          priority
        />
      </motion.div>
    </IllustrationWrapper>
  );
};

const IllustrationWrapper = styled(BaseIllustration)`
  display: none;
  background: radial-gradient(at 0% 0%, #fff6f3 16%, rgba(246, 209, 193, 0) 50%),
    radial-gradient(at 0% 100%, #f2f9ff 0%, rgba(200, 228, 255, 0) 100%),
    radial-gradient(at 100% 50%, #fefff0 0%, white 100%), white;

  ${media.greaterThan('md')`
      display: block;
    `}

  .phone-image {
    transform: translate(0%, 50%);
    position: absolute;
    z-index: 1;
    width: auto;
    will-change: opacity, transform;
  }

  .code-image {
    transform: translate(0%, 50%);
    position: absolute;
    z-index: 0;
    will-change: opacity, transform;
  }
`;
export default DesktopIllustration;
