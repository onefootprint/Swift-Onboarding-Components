import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBuilding24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5 6.75A2.75 2.75 0 0 1 7.75 4h8.5A2.75 2.75 0 0 1 19 6.75V18.5h.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H5V6.75Zm5.5 11.75h3v-2.75c0-.69-.56-1.25-1.25-1.25h-.5c-.69 0-1.25.56-1.25 1.25v2.75Zm4.5 0v-2.75A2.75 2.75 0 0 0 12.25 13h-.5A2.75 2.75 0 0 0 9 15.75v2.75H6.5V6.75c0-.69.56-1.25 1.25-1.25h8.5c.69 0 1.25.56 1.25 1.25V18.5H15ZM9 10a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm5-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBuilding24;
