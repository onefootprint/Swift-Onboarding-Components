import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMessage16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeLinecap="square">
        <path
          d="M14.5 8c0-3.438-2.528-5.5-6.5-5.5S1.5 4.563 1.5 8c0 .891.614 2.404.71 2.635l.025.06c.066.18.336 1.14-.735 2.56 1.444.688 2.978-.443 2.978-.443 1.062.561 2.325.688 3.522.688 3.972 0 6.5-2.063 6.5-5.5Z"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <path
          d="M4.5 8a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm3 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Zm3 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0Z"
          fill={theme.color[color]}
          strokeWidth={0.5}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoMessage16;
