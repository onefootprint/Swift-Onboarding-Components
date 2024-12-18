import { motion, useAnimation } from 'framer-motion';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useState } from 'react';

import {
  ApitureLogo,
  Aryeo,
  BloomLogo,
  ComposerLogo,
  FindigsLogo,
  FlexcarLogo,
  Goodfin,
  GridLogo,
  WingSpan,
  YieldStreet,
} from 'src/components/company-logos';

const logos = [
  ComposerLogo,
  GridLogo,
  FlexcarLogo,
  FindigsLogo,
  ApitureLogo,
  BloomLogo,
  YieldStreet,
  WingSpan,
  Goodfin,
  Aryeo,
];

const GROUP_SIZE = 4;
const ANIMATION_SPEED = 4000;

const marqueeContainerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'loop' as const,
    },
  },
};

const marqueeItemVariants = {
  initial: {
    opacity: 0,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
      ease: 'linear',
    },
  },
};

const Logos = () => {
  const [currentLogos, setCurrentLogos] = useState(logos.slice(0, GROUP_SIZE));
  const [index, setIndex] = useState(0);
  const controls = useAnimation();

  const getNextLogoGroup = () => {
    const nextIndex = (index + GROUP_SIZE) % logos.length;
    const nextLogos = [];
    for (let i = 0; i < GROUP_SIZE; i++) {
      nextLogos.push(logos[(nextIndex + i) % logos.length]);
    }
    setCurrentLogos(nextLogos);
    setIndex(nextIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getNextLogoGroup();
    }, ANIMATION_SPEED);
    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    controls.start('animate');
  }, [currentLogos, controls]);

  return (
    <motion.div
      className="grid w-full grid-cols-2 grid-rows-2 gap-3 h-[120px] md:w-auto md:grid-cols-4 md:grid-rows-1 md:h-[80px] md:gap-8"
      variants={marqueeContainerVariants}
      initial="initial"
      animate={controls}
    >
      {currentLogos.map(logo => {
        const RenderedLogo = logo;
        return (
          <motion.div
            className="flex flex-row items-center justify-center"
            variants={marqueeItemVariants}
            key={uniqueId()}
          >
            <RenderedLogo className="text-tertiary" />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Logos;
