import { DirectionChange } from './date-selector-sheet.types';

const ANIMATION_LENGTH = 20;

export const getMoveVariants = (direction: DirectionChange) => ({
  initial: {
    x: direction === DirectionChange.previous ? -ANIMATION_LENGTH : ANIMATION_LENGTH,
    opacity: 0,
  },
  animate: { x: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: {
    x: direction === DirectionChange.previous ? -ANIMATION_LENGTH : ANIMATION_LENGTH,
    opacity: 0,
  },
});

export const containerVariants = {
  layout: {
    type: 'spring',
    stiffness: 1000,
    damping: 50,
    duration: 0.1,
  },
};
