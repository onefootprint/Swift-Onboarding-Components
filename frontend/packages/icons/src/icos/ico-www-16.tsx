import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoWww16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M14.75 8A6.75 6.75 0 0 0 8 1.25M14.75 8H1.25m13.5 0c0 .646-.09 1.27-.26 1.862M8 1.25A6.75 6.75 0 0 0 1.25 8M8 1.25C6.843 1.25 4.974 3.81 4.974 8c0 .663.047 1.285.13 1.862M8 1.25c1.157 0 3.026 2.56 3.026 6.75 0 .663-.047 1.285-.13 1.862M1.25 8c0 .646.09 1.27.26 1.862m.206 2.56.465 2.328 1.164-1.397 1.164 1.397.465-2.328m1.397 0 .465 2.328L8 13.353l1.164 1.397.465-2.328m1.397 0 .465 2.328 1.164-1.397 1.164 1.397.465-2.328"
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
export default IcoWww16;
