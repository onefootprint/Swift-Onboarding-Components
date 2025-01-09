export const fromBottom = {
  initial: { opacity: 0, y: 10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromBottomToTop = {
  initial: { opacity: 0, y: 10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromBottomToBottom = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, y: 10, height: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromTop = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromTopToBottom = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, y: 10, height: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromTopToTop = {
  initial: { opacity: 0, y: -10, height: 0 },
  animate: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, y: 10, height: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromLeft = {
  initial: { opacity: 0, x: -10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromLeftToRight = {
  initial: { opacity: 0, x: -10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, x: 10, width: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromLeftToLeft = {
  initial: { opacity: 0, x: -10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, x: 10, width: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromRight = {
  initial: { opacity: 0, x: 10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromRightToLeft = {
  initial: { opacity: 0, x: 10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -10, width: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromRightToRight = {
  initial: { opacity: 0, x: 10, width: 0 },
  animate: { opacity: 1, x: 0, width: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, x: -10, width: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};

export const fromCenter = {
  initial: { opacity: 0, scale: 0.95, height: 0 },
  animate: { opacity: 1, scale: 1, height: 'auto', transition: { duration: 0.1, ease: 'easeInOut' } },
  exit: { opacity: 0, scale: 0.95, height: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
};
