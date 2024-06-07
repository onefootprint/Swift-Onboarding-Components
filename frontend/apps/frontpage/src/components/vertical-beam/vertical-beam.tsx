import { motion } from 'framer-motion';
import React, { useId } from 'react';

type VerticalBeamProps = {
  width: number;
  height: number;
  path: string;
  speed: number;
  delay: number;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
  strokeColor?: string;
};

const VerticalBeam = ({
  width,
  height,
  speed,
  delay,
  colorStart = '#76FB8F',
  colorEnd = '#769BFB',
  path,
  className,
  strokeColor = '#5F668C',
}: VerticalBeamProps) => {
  const id = useId();
  const BEAM_WIDTH = 40;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height + 2}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d={path} stroke={strokeColor} strokeLinecap="round" strokeWidth="1" strokeOpacity="0.2" />
      <path d={path} stroke={`url(#${id})`} strokeLinecap="round" strokeWidth="1" />
      <path d={path} stroke={`url(#${id}-back)`} strokeLinecap="round" strokeWidth="1" />
      <defs>
        <motion.linearGradient
          key={id}
          id={id}
          gradientUnits="userSpaceOnUse"
          animate={{
            y1: [-BEAM_WIDTH, height + BEAM_WIDTH],
            y2: [-BEAM_WIDTH * 2, height],
            x1: [width, width],
            x2: [width, width],
          }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: speed,
            delay,
            repeatDelay: 5,
          }}
        >
          <stop stopColor={colorStart} stopOpacity="0" />
          <stop stopColor={colorStart} />
          <stop offset="1" stopColor={colorEnd} stopOpacity="0" />
        </motion.linearGradient>
        <motion.linearGradient
          key={`${id}-back`}
          id={`${id}-back`}
          gradientUnits="userSpaceOnUse"
          animate={{
            y1: [height, -BEAM_WIDTH * 2],
            y2: [height + BEAM_WIDTH, -BEAM_WIDTH],
            x1: [width, width],
            x2: [width, width],
          }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: speed * 1.1,
            delay,
            repeatDelay: 6,
          }}
        >
          <stop stopColor={colorEnd} stopOpacity="0" />
          <stop stopColor={colorEnd} />
          <stop stopColor={colorStart} stopOpacity="0" offset="1" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
export default VerticalBeam;
