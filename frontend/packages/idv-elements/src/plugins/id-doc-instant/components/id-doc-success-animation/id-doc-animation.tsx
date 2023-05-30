import { DocStatusKind } from '@onefootprint/types';
import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useEffect, useState } from 'react';
import styled from 'styled-components';

import TRANSITION_DELAY from '../../constants/transition-delay.constants';

type IdDocAnimationProps = {
  loadingComponent: ReactNode;
  successComponent: ReactNode;
  nextSideComponent: ReactNode;
  status: DocStatusKind;
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
  loadingComponent,
  successComponent,
  nextSideComponent,
  status,
}: IdDocAnimationProps) => {
  const [isShowingSuccess, setIsShowingSuccess] = useState(false);
  const [isShowingNextSide, setIsShowingNextSide] = useState(false);

  useEffect(() => {
    if (status === DocStatusKind.complete) {
      setIsShowingSuccess(true);
      setTimeout(() => {
        setIsShowingSuccess(false);
        setIsShowingNextSide(true);
      }, TRANSITION_DELAY);
    }
  }, [status]);

  return (
    <>
      <AnimatePresence>
        {status === DocStatusKind.pending && (
          <motion.div exit={{ opacity: 0 }}>{loadingComponent}</motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isShowingSuccess && (
          <SuccessFeedbackContainer
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={successFeedbackVariants}
          >
            {successComponent}
          </SuccessFeedbackContainer>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isShowingNextSide && (
          <NextSideContainer
            style={{}}
            initial="hiddenBelow"
            animate="slideIn"
            exit="exit"
            variants={nextSideVariants}
          >
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
