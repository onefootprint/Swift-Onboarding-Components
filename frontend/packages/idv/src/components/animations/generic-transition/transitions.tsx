import { easeIn, easeInOut } from 'framer-motion';

export const firstIconVariantTransition = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { easeIn, duration: 0.1, delay: 0.1 } },
  exit: { y: -10, opacity: 0 },
};

export const firstTextVariantTransition = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { easeIn, delay: 0.2 } },
  exit: { y: -10, opacity: 0 },
};

export const secondIconVariantTransition = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { easeIn, delay: 0.5 } },
  exit: { y: -10, opacity: 0, transition: { easeIn, duration: 0.1 } },
};

export const secondTextVariantTransition = {
  initial: { y: 10, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { easeInOut, delay: 0.1 } },
  exit: { y: -10, opacity: 0, transition: { easeIn, duration: 0.1 } },
};
