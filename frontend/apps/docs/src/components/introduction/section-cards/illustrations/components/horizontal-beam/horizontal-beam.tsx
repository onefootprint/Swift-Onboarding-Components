import { motion, useAnimationControls } from 'framer-motion';
import React, { useEffect, useId } from 'react';

type HorizontalBeamProps = {
  width: number;
  height: number;
  path: string;
  speed: number;
  delay: number;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
  strokeColor?: string;
  isHovered?: boolean;
};

const HorizontalBeam = ({
  width,
  height,
  speed = 4,
  delay = 0,
  colorStart = '#76FB8F',
  colorEnd = '#769BFB',
  path,
  className,
  strokeColor = '#5F668C',
  isHovered = false,
}: HorizontalBeamProps) => {
  const id = useId();

  const controls = useAnimationControls();

  useEffect(() => {
    if (isHovered) {
      controls.start({
        x1: [0, width + 80],
        x2: [-80, width],
        y1: [height, height],
        y2: [height, height],
      });
    } else {
      controls.start({
        x1: [0, 0],
        x2: [0, 0],
        y1: [height, height],
        y2: [height, height],
      });
    }
  }, [controls, height, isHovered, width]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height + 2}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d={path} stroke={strokeColor} strokeLinecap="round" strokeWidth="1" strokeOpacity="0.5" />
      <path d={path} stroke={`url(#${id})`} strokeLinecap="round" strokeWidth="1" />
      <path d={path} stroke={`url(#${id}-back)`} strokeLinecap="round" strokeWidth="1" />
      <defs>
        <motion.linearGradient
          key={id}
          id={id}
          gradientUnits="userSpaceOnUse"
          animate={controls}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: speed,
            delay,
          }}
        >
          <stop stopColor={colorStart} stopOpacity="0" />
          <stop stopColor={colorStart} />
          <stop offset="1" stopColor={colorEnd} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
export default HorizontalBeam;
