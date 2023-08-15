const STEP_DURATION = 2;
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

export const CheckIconVariants = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  animate: {
    opacity: 1,
    scale: [1.2, 0.9],
    transition: {
      delay: 1,
      duration: TRANSITION_DURATION,
      ease: 'easeInOut',
    },
  },
};
