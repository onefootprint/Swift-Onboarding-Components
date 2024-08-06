import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoStore24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m19.708 8.46-2.32-3.01a.833.833 0 0 0-.66-.325H7.272a.833.833 0 0 0-.66.325L4.29 8.46m15.417 0v.833c0 .741-.33 1.407-.856 1.865m.856-2.698H4.292m0 0v.833c0 .741.33 1.407.856 1.865m13.704 0a2.6 2.6 0 0 1-1.713.636c-1.42 0-2.57-1.12-2.57-2.5m4.283 1.864v6.884c0 .46-.373.833-.834.833H5.981a.833.833 0 0 1-.833-.833v-6.884m0 0a2.6 2.6 0 0 0 1.713.636c1.419 0 2.57-1.12 2.57-2.5m5.138 0V8.46m0 .833c0 1.382-1.15 2.502-2.57 2.502-1.418 0-2.569-1.12-2.569-2.502m0 0V8.46m4.283 10.415v-2.501c0-.92-.767-1.667-1.713-1.667-.946 0-1.713.746-1.713 1.667v2.501"
        stroke={theme.color[color]}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoStore24;
