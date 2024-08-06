import { AnimatePresence, motion } from 'framer-motion';
import styled, { useTheme } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

import Stack from '../stack';

type AnimatedSuccessCheckProps = {
  animationStart: boolean;
  onComplete?: () => void;
  size?: number;
};

const checkVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    pathOffset: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

const circleVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    pathOffset: 1,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
      delay: 0.4,
    },
  },
};

const translationOptions = [
  ['translate(-25%, -25%)', 'translate(-40%, -40%)'],
  ['translate(-25%, 25%)', 'translate(-40%, 40%)'],
  ['translate(25%, -25%)', 'translate(40%, -40%)'],
  ['translate(25%, 25%)', 'translate(40%, 40%)'],
];

const explodeCircleVariants = (index: number) => ({
  hidden: {
    opacity: 0,
    scale: 0,
    transform: translationOptions[index],
  },
  visible: {
    opacity: [0, 1, 0],
    transform: translationOptions[index],
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
      delay: 0.5,
    },
  },
});

const AnimatedSuccessCheck = ({ onComplete, animationStart, size = 32 }: AnimatedSuccessCheckProps) => {
  const theme = useTheme();
  useTimeout(
    () => {
      if (animationStart && onComplete) {
        onComplete();
      }
    },
    animationStart ? 1000 : null,
  );

  const scale = size / 40;

  return (
    <Container $height={size} $width={size} align="center" justify="center">
      <AnimatePresence>
        {animationStart && (
          <motion.svg
            initial="hidden"
            animate="visible"
            exit="hidden"
            onAnimationComplete={onComplete}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d={`M${1.59833 * scale} ${7.65486 * scale}L${2.41521 * scale} ${
                9.39584 * scale
              }C${3.0626 * scale} ${10.7606 * scale} ${4.99533 * scale} ${
                10.8551 * scale
              } ${5.75385 * scale} ${9.53316 * scale}L${10.0737 * scale} ${2.00464 * scale}`}
              stroke={theme.color.success}
              strokeWidth={3 * scale}
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkVariants}
              style={{
                transform: `translate(${size / 2.8}px, ${size / 3}px)`,
                transformOrigin: 'center',
              }}
            />
            <motion.path
              d={`M${1.86441 * scale} ${15.3009 * scale}C${1.86441 * scale} ${
                7.75966 * scale
              } ${7.97783 * scale} ${1.64624 * scale} ${15.5191 * scale} ${
                1.64624 * scale
              }C${23.0604 * scale} ${1.64624 * scale} ${29.1738 * scale} ${
                7.75966 * scale
              } ${29.1738 * scale} ${15.3009 * scale}C${29.1738 * scale} ${
                22.8422 * scale
              } ${23.0604 * scale} ${28.9557 * scale} ${15.5191 * scale} ${
                28.9557 * scale
              }C${7.97783 * scale} ${28.9557 * scale} ${1.86441 * scale} ${
                22.8422 * scale
              } ${1.86441 * scale} ${15.3009 * scale}Z`}
              stroke={theme.color.success}
              strokeWidth={3 * scale}
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={circleVariants}
              transform={`translate(${size / 8}, ${size / 8})`}
            />
            {translationOptions.map((_, index) => (
              <motion.circle
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                key={index}
                cx="50%"
                cy="50%"
                r={scale * 3}
                fill={theme.color.success}
                variants={explodeCircleVariants(index)}
              />
            ))}
          </motion.svg>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled(Stack)<{ $height: number; $width: number }>`
  ${({ $height, $width }) => `
        height: ${$height}px;
        width: ${$width}px;
        display: flex; 
        justify-content: center;
        align-items: center; 
    `}
`;

export default AnimatedSuccessCheck;
