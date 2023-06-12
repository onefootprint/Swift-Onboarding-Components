import { motion } from 'framer-motion';
import React, { useId } from 'react';

type CircularBeamProps = {
  diameter: number;
  speed: number;
  delay: number;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
};

const CircularBeam = ({
  diameter,
  speed,
  delay,
  colorStart = '#76FB8F',
  colorEnd = '#769BFB',
  className,
}: CircularBeamProps) => {
  const id = useId();
  return (
    <svg
      width={diameter + 2}
      height={diameter + 2}
      viewBox={`0 0 ${diameter + 4} ${diameter + 4}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx={diameter / 2}
        cy={diameter / 2}
        r={diameter / 2 - 2}
        stroke="transparent"
        strokeWidth="1"
        className={className}
      />

      <circle
        cx={diameter / 2}
        cy={diameter / 2}
        r={diameter / 2 - 2}
        stroke={`url(#${id})`}
        strokeWidth="1"
        className={className}
      />

      <defs>
        <motion.linearGradient
          key={id}
          id={id}
          gradientUnits="userSpaceOnUse"
          animate={{
            gradientTransform: ['rotate(0)', 'rotate(360)'],
          }}
          transition={{
            repeat: Infinity,
            ease: 'easeInOut',
            duration: speed,
            repeatType: 'reverse',
            delay,
          }}
        >
          <stop offset=".5" stopColor="transparent" />
          <stop offset="1" stopColor={colorStart} />
          <stop offset="1" stopColor={colorEnd} />
          <stop offset=".5" stopColor="transparent" />
          <stop offset=".5" stopColor={colorStart} />
          {/* <stop stopColor="transparent" /> */}
        </motion.linearGradient>
      </defs>
    </svg>
  );
};
export default CircularBeam;
