import { motion, useAnimationControls } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useId } from 'react';

type VerticalBeamProps = {
  width: number;
  height: number;
  path: string;
  speed: number;
  delay: number;
  colorStart?: string;
  colorEnd?: string;
  className?: string;
  isHovered?: boolean;
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
  isHovered = false,
}: VerticalBeamProps) => {
  const id = useId();
  const controls = useAnimationControls();
  const theme = useTheme();
  const isDark = theme.theme === 'dark';

  useEffect(() => {
    if (isHovered) {
      controls.start({
        y1: [0, height],
        y2: [-80, height],
        x1: [width, width],
        x2: [width, width],
      });
    } else {
      controls.start({
        y1: [0, height],
        y2: [0, height],
        x1: [width, width],
        x2: [width, width],
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
      <path
        d={path}
        stroke={isDark ? '#4b4b4c' : '#b3b4b8'}
        strokeLinecap="round"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
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
export default VerticalBeam;
