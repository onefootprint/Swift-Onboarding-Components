import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFilter16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M12.833 2.5H3.167a.667.667 0 0 0-.667.667v1.89c0 .177.07.347.195.472l3.61 3.61a.667.667 0 0 1 .195.47v4.558l3-.834V9.61c0-.176.07-.346.195-.47l3.61-3.61a.667.667 0 0 0 .195-.472v-1.89a.667.667 0 0 0-.667-.667Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
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
export default IcoFilter16;
