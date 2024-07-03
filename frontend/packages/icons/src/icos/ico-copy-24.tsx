import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCopy24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.5 6.75c0-.69.56-1.25 1.25-1.25h6.75a1 1 0 0 1 1 1 .75.75 0 0 0 1.5 0A2.5 2.5 0 0 0 13.5 4H6.75A2.75 2.75 0 0 0 4 6.75v6.75A2.5 2.5 0 0 0 6.5 16a.75.75 0 0 0 0-1.5 1 1 0 0 1-1-1V6.75Zm4 4c0-.69.56-1.25 1.25-1.25h6.5c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-6.5ZM10.75 8A2.75 2.75 0 0 0 8 10.75v6.5A2.75 2.75 0 0 0 10.75 20h6.5A2.75 2.75 0 0 0 20 17.25v-6.5A2.75 2.75 0 0 0 17.25 8h-6.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCopy24;
