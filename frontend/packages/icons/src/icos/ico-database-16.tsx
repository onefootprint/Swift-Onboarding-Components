import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDatabase16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M12.833 3.546c0 .946-2.164 1.713-4.833 1.713-2.67 0-4.833-.767-4.833-1.713m9.666 0c0-.946-2.164-1.713-4.833-1.713-2.67 0-4.833.767-4.833 1.713m9.666 0v8.908c0 .946-2.164 1.713-4.833 1.713-2.67 0-4.833-.767-4.833-1.713V3.546m9.666 2.907c0 .946-2.164 1.713-4.833 1.713-2.67 0-4.833-.767-4.833-1.713m9.666 2.833C12.833 10.233 10.67 11 8 11c-2.67 0-4.833-.767-4.833-1.713"
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
export default IcoDatabase16;
