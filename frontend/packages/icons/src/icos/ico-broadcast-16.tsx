import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBroadcast16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          d="M3.64 3.64A6.147 6.147 0 0 0 1.833 8c0 1.703.69 3.245 1.807 4.36m1.938-6.782A3.415 3.415 0 0 0 4.574 8c0 .947.384 1.803 1.004 2.423m4.845 0A3.415 3.415 0 0 0 11.426 8c0-.946-.383-1.802-1.003-2.422m1.938 6.783A6.147 6.147 0 0 0 14.167 8c0-1.703-.69-3.245-1.806-4.361M8.5 8a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={8} cy={8} r={0.5} fill={theme.color[color]} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoBroadcast16;
