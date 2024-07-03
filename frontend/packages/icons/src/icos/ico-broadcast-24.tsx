import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBroadcast24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.536 5.47a.75.75 0 0 1 0 1.06 7.736 7.736 0 0 0 0 10.94.75.75 0 0 1-1.06 1.061 9.236 9.236 0 0 1 0-13.061.75.75 0 0 1 1.06 0Zm10.94 0a.75.75 0 0 1 1.06 0 9.236 9.236 0 0 1 0 13.061.75.75 0 0 1-1.06-1.06 7.736 7.736 0 0 0 0-10.94.75.75 0 0 1 0-1.061Zm-1.422 2.482a.75.75 0 0 0-1.061 1.061 4.225 4.225 0 0 1 0 5.974.75.75 0 1 0 1.06 1.061 5.725 5.725 0 0 0 0-8.096Zm-7.035 0a.75.75 0 0 1 0 1.061 4.224 4.224 0 0 0 0 5.974.75.75 0 1 1-1.061 1.061 5.724 5.724 0 0 1 0-8.096.75.75 0 0 1 1.06 0ZM11.92 12a.085.085 0 1 1 .17 0 .085.085 0 0 1-.17 0Zm.085-1.085a1.085 1.085 0 1 0 0 2.17 1.085 1.085 0 0 0 0-2.17Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBroadcast24;
