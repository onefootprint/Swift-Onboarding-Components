import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import BaseIllustration from 'src/pages/home/components/base-illustration';
import styled from 'styled-components';

const KybIllustration = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.new-approach.kyb',
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const phoneControls = useAnimation();

  const variants = {
    initial: {
      scale: 0.5,
      opacity: 0,
      transform: 'translateX(-50%)',
      left: '50%',
      top: '100px',
    },
    animate: {
      scale: 1,
      opacity: 1,
      top: isMobile && !isTablet ? '40px' : '64px',
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: 1,
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      phoneControls.start(variants.animate);
    } else {
      phoneControls.start(variants.initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <StyledBaseIllustration>
      <PhoneContainer ref={ref} animate={phoneControls}>
        <Image
          src="/home/new-approach/kyb.png"
          width={296}
          height={605}
          alt={t('alt-image')}
        />
      </PhoneContainer>
    </StyledBaseIllustration>
  );
};

const StyledBaseIllustration = styled(BaseIllustration)`
  height: 100%;
`;

const PhoneContainer = styled(motion.div)`
  position: absolute;
  width: 296px;
  height: 605px;
  max-width: 90%;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

export default KybIllustration;
