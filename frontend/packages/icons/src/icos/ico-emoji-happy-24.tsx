import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoEmojiHappy24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 4A4.75 4.75 0 0 0 4 8.75v6.5A4.75 4.75 0 0 0 8.75 20h6.5A4.75 4.75 0 0 0 20 15.25v-6.5A4.75 4.75 0 0 0 15.25 4h-6.5ZM5.5 8.75A3.25 3.25 0 0 1 8.75 5.5h6.5a3.25 3.25 0 0 1 3.25 3.25v6.5a3.25 3.25 0 0 1-3.25 3.25h-6.5a3.25 3.25 0 0 1-3.25-3.25v-6.5Zm1.915 3.33a.75.75 0 0 1 1.004.331l.006.01a3.449 3.449 0 0 0 .182.289c.139.2.353.467.647.735A3.977 3.977 0 0 0 12 14.5a3.977 3.977 0 0 0 2.745-1.055 4.458 4.458 0 0 0 .798-.967 2.03 2.03 0 0 0 .032-.056l.006-.01a.75.75 0 0 1 1.34.673l-.671-.335.67.336v.002l-.003.004-.005.01a1.733 1.733 0 0 1-.074.134 5.96 5.96 0 0 1-1.083 1.319A5.476 5.476 0 0 1 12 16a5.476 5.476 0 0 1-3.755-1.445 5.963 5.963 0 0 1-.867-.984 4.946 4.946 0 0 1-.29-.468l-.005-.01-.002-.005-.001-.001c0-.001 0-.002.67-.337l-.67.335a.75.75 0 0 1 .335-1.006ZM9 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmojiHappy24;
