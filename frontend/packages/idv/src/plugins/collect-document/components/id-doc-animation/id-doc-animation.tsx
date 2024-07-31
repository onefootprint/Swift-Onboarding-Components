import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { TRANSITION_DELAY_DEFAULT } from '../../constants';

type IdDocAnimationProps = {
  mode: 'loading' | 'success';
  hasNextSide: boolean;
  loadingComponent: ReactNode;
  successComponent: ReactNode;
  nextSideComponent?: ReactNode;
};

const successFeedbackVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.3, type: 'tween', duration: 0.35 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { type: 'tween', duration: 0.35 },
  },
};

const nextSideVariants = {
  hiddenBelow: { opacity: 0, y: 20 },
  slideIn: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1, type: 'tween', duration: 0.35 },
  },
  exit: {
    opacity: 0,
    transition: { type: 'tween' },
  },
};

const IdDocAnimation = ({
  mode,
  hasNextSide,
  loadingComponent,
  successComponent,
  nextSideComponent,
}: IdDocAnimationProps) => {
  const [isShowingSuccess, setIsShowingSuccess] = useState(false);
  const [isShowingNextSide, setIsShowingNextSide] = useState(false);

  // We start with loading mode
  // When the mode becomes "success", we show "success"
  // and start a timer after which we show nextSide component
  // There are animations in the way how the components appear and disappear
  useEffect(() => {
    if (mode === 'success') {
      setIsShowingSuccess(true);
      setTimeout(() => {
        if (hasNextSide) {
          setIsShowingSuccess(false);
          setIsShowingNextSide(true);
        }
      }, TRANSITION_DELAY_DEFAULT);
    }
  }, [mode, hasNextSide]);

  return (
    <>
      <AnimatePresence>
        {mode === 'loading' && <motion.div exit={{ opacity: 0 }}>{loadingComponent}</motion.div>}
      </AnimatePresence>
      <AnimatePresence>
        {isShowingSuccess && (
          <SuccessFeedbackContainer initial="hidden" animate="visible" exit="exit" variants={successFeedbackVariants}>
            {successComponent}
          </SuccessFeedbackContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isShowingNextSide && (
          <NextSideContainer style={{}} initial="hiddenBelow" animate="slideIn" exit="exit" variants={nextSideVariants}>
            {nextSideComponent}
          </NextSideContainer>
        )}
      </AnimatePresence>
    </>
  );
};

const SuccessFeedbackContainer = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
`;

const NextSideContainer = styled(motion.div)`
  position: absolute;
  left: 0;
  right: 0;
`;

export default IdDocAnimation;
