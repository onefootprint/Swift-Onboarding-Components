const STEP_DURATION = 1.5;
const TRANSITION_DURATION = 0.2;

export const firstIconContainerVariants = {
  initial: {
    opacity: 1,
    y: 0,
  },
  animate: {
    opacity: 0,
    y: -10,
    transition: {
      delay: STEP_DURATION,
      duration: TRANSITION_DURATION,
      ease: 'easeOut',
    },
  },
};

export const checkIconVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: [0, 1, 1, 1, 0],
    scale: [1, 0.8],
    transition: {
      duration: STEP_DURATION,
      ease: 'easeIn',
    },
  },
};

export const secondIconContainerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      delay: STEP_DURATION,
      duration: TRANSITION_DURATION,
      ease: 'easeInOut',
    },
  },
};

export const firstTextContainerVariants = {
  initial: {
    opacity: 1,
    y: 0,
  },
  animate: {
    opacity: 0,
    y: -10,
    transition: {
      delay: STEP_DURATION,
      duration: TRANSITION_DURATION,
      ease: 'easeInOut',
    },
  },
};

export const secondTextContainerVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: STEP_DURATION + 0.1,
      duration: 0.2,
    },
  },
};
