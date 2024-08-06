import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWorld16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="m9.497 2.016-.731 2.93a.667.667 0 0 1-.485.485l-1.98.498a.667.667 0 0 0-.433.347l-.174.346a.667.667 0 0 1-.995.234L2.5 5.208m6.997-3.192A6.18 6.18 0 0 0 2.5 5.208m6.997-3.192A6.167 6.167 0 1 1 2.5 5.208m5.304 5.829-.832-1.248a.667.667 0 0 1 .085-.842l.138-.138a.667.667 0 0 1 .513-.193l.816.052a.666.666 0 0 1 .329.112l1.33.893a.667.667 0 0 1 .224.851l-.22.44a.667.667 0 0 1-.597.37H8.36a.667.667 0 0 1-.555-.297Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
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
export default IcoWorld16;
