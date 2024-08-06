import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTwitter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        d="M21.375 6.276a7.8 7.8 0 0 1-2.209.596 3.808 3.808 0 0 0 1.691-2.096 7.754 7.754 0 0 1-2.442.919A3.874 3.874 0 0 0 15.607 4.5c-2.124 0-3.846 1.696-3.846 3.788 0 .296.034.583.099.861a10.982 10.982 0 0 1-7.93-3.956 3.74 3.74 0 0 0-.52 1.903c0 1.314.68 2.474 1.711 3.152a3.885 3.885 0 0 1-1.742-.474v.05c0 1.834 1.325 3.364 3.086 3.712a3.931 3.931 0 0 1-1.738.065 3.842 3.842 0 0 0 3.594 2.629 7.798 7.798 0 0 1-4.778 1.622c-.31 0-.617-.018-.918-.053A11.005 11.005 0 0 0 8.521 19.5c7.077 0 10.946-5.77 10.946-10.773 0-.163-.005-.327-.012-.49a7.753 7.753 0 0 0 1.918-1.959l.002-.002Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTwitter24;
