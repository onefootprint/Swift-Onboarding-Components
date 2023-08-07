import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import BaseIllustration from 'src/pages/home/components/base-illustration';

const KycIllustration = () => {
  const { t } = useTranslation('home.new-approach.kyc');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const phoneControls = useAnimation();
  const faceIdControls = useAnimation();

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
      top: '64px',
      transition: {
        duration: 1.2,
        ease: 'easeOut',
        delay: 0.8,
      },
    },
  };

  const faceIdVariants = {
    initial: {
      opacity: 0,
      y: 0,
    },
    animate: {
      opacity: 1,
      y: -20,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: 0.5,
      },
    },
  };

  useEffect(() => {
    if (isInView) {
      phoneControls.start(variants.animate);
      faceIdControls.start(faceIdVariants.animate);
    } else {
      phoneControls.start(variants.initial);
      faceIdControls.start(faceIdVariants.initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView]);

  return (
    <StyledBaseIllustration>
      <PhoneContainer ref={ref} animate={phoneControls}>
        <Image
          src="/home/new-approach/kyc.png"
          width={296}
          height={605}
          alt={t('alt-image')}
        />
      </PhoneContainer>
      <FaceIdContainer animate={faceIdControls}>
        <Image
          src="/home/new-approach/face-id.png"
          width={138}
          height={138}
          alt="face-id"
        />
      </FaceIdContainer>
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
    height: auto;
    object-fit: contain;
  }
`;

const FaceIdContainer = styled(motion.div)`
  ${({ theme }) => css`
    position: absolute;
    left: 16px;
    bottom: -40px;
    transform: translateX(-50%);
    width: 138px;
    height: 138px;
    z-index: 1;
    border-radius: ${theme.borderRadius.default};
    background-color: white;

    img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    ${media.greaterThan('sm')`
      left: 20%;
    `}
  `}
`;

export default KycIllustration;
