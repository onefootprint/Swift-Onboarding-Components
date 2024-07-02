import type { MotionValue } from 'framer-motion';
import { motion, useAnimationControls, useMotionValueEvent, useTransform } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

type IllustrationAppClipProps = {
  scroll: MotionValue;
};

const VISIBLE_RANGE = {
  initial: 0.85,
  initialMax: 0.9,
  appClipReveal: 0.95,
};

const IllustrationAppClip = ({ scroll }: IllustrationAppClipProps) => {
  const appClipSheetControls = useAnimationControls();
  const [isAppClipVisible, setIsAppClipVisible] = useState(false);

  const appClipSheetVariants = {
    hidden: {
      y: '340px',
      x: '21px',
      opacity: 0,
      transition: {
        duration: 0.1,
      },
    },
    visible: {
      y: '322px',
      x: '21px',
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  useMotionValueEvent(scroll, 'change', latest => {
    if (latest >= VISIBLE_RANGE.appClipReveal) {
      appClipSheetControls.start('visible');
      setIsAppClipVisible(true);
    } else {
      appClipSheetControls.start('hidden');
      setIsAppClipVisible(false);
    }
  });

  useEffect(() => {
    if (isAppClipVisible) {
      appClipSheetControls.start(appClipSheetVariants.visible);
    } else {
      appClipSheetControls.start(appClipSheetVariants.hidden);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppClipVisible]);

  const opacity = useTransform(scroll, [VISIBLE_RANGE.initial, VISIBLE_RANGE.initialMax], ['0%', '100%']);

  return (
    <Container style={{ opacity }}>
      <PhoneContainer>
        <PhoneFrame src="/iphone.png" alt="" width={375} height={812} />
        <BackgroundPhone src="/kyc/sticky-rail/background.png" alt="" width={1596} height={2496} />
        <AppClipSheetContainer animate={appClipSheetControls}>
          <AppClipSheet src="/kyc/sticky-rail/app-clip-sheet.png" alt="" width={1717} height={1542} />
        </AppClipSheetContainer>
      </PhoneContainer>
    </Container>
  );
};

const Container = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
  touch-action: none;
`;

const PhoneContainer = styled.div`
  ${({ theme }) => css`
    width: 320px;
    height: 650px;
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    isolation: isolate;
    position: relative;
    overflow: hidden;
  `}
`;

const PhoneFrame = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 2;
  position: absolute;
  border-radius: 45px;
  overflow: hidden;
`;

const BackgroundPhone = styled(Image)`
  position: absolute;
  width: 289px;
  height: 626px;
  border-radius: 45px;
  top: 50%;
  left: 50%;
  z-index: 0;
  object-fit: contain;
  transform: translate(-50%, -50%);
  overflow: hidden;
`;

const AppClipSheetContainer = styled(motion.span)`
  position: absolute;
  width: 279px;
  height: 310px;
  z-index: 1;
  position: absolute;
  border-radius: 38px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.8);
`;

const AppClipSheet = styled(Image)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export default IllustrationAppClip;
