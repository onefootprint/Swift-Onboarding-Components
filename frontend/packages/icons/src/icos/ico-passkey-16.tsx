import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPasskey16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 16 16"
    >
      <path
        d="M8 8.667c-2.531 0-4.378 1.682-4.886 3.944-.087.383.225.722.617.722h5.601m1-9a2.333 2.333 0 1 1-4.666 0 2.333 2.333 0 0 1 4.666 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7.333a2 2 0 0 0-.833 3.819v2.355c0 .1.046.197.125.26l.5.4a.333.333 0 0 0 .416 0l.5-.4a.333.333 0 0 0 .125-.26v-.556l-.5-.451.5-.5v-.848A2 2 0 0 0 12 7.333Zm-.667 2a.667.667 0 1 1 1.334 0 .667.667 0 0 1-1.334 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPasskey16;
