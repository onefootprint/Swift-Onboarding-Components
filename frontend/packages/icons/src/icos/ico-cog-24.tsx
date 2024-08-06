import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCog24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M18.875 12a6.844 6.844 0 0 0-.92-3.438m.92 3.438a6.844 6.844 0 0 1-.92 3.438m.92-3.438h-5m5 0h1.667m-2.587-3.438 1.443-.833m-1.443.833a6.91 6.91 0 0 0-2.517-2.517m2.517 9.393 1.443.832m-1.443-.832a6.908 6.908 0 0 1-2.517 2.517M13.875 12a1.875 1.875 0 0 1-2.813 1.624M13.876 12a1.875 1.875 0 0 0-2.813-1.624M12 18.875a6.843 6.843 0 0 1-3.438-.92m3.438.92a6.843 6.843 0 0 0 3.438-.92m-3.438.92v1.667m-3.438-2.587-.833 1.442m.833-1.442 2.5-4.331m-2.5 4.33a6.909 6.909 0 0 1-2.517-2.516m9.393 2.517.833 1.442M5.125 12c0 1.252.335 2.427.92 3.438M5.125 12c0-1.253.335-2.427.92-3.438M5.125 12H3.458m2.587 3.438-1.442.833m1.442-7.71L4.603 7.73m1.442.833a6.909 6.909 0 0 1 2.517-2.517M12 5.125a6.843 6.843 0 0 0-3.438.92M12 5.125c1.253 0 2.427.335 3.438.92M12 5.125V3.458M8.562 6.045 7.73 4.603m.833 1.442 2.5 4.33m4.376-4.33.833-1.442m-5.209 9.02a1.875 1.875 0 0 1 0-3.247"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" transform="translate(2 2)" d="M0 0h20v20H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoCog24;
