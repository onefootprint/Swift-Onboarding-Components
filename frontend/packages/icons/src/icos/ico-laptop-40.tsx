import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoLaptop40 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.268.661a4.175 4.175 0 0 0-4.175 4.175V25.45c0 .102.009.203.026.301L1.32 34.29a4.175 4.175 0 0 0 4.086 5.035h29.186a4.175 4.175 0 0 0 4.086-5.035l-1.798-8.54c.017-.097.026-.198.026-.3V4.836A4.175 4.175 0 0 0 32.732.661H7.268ZM33.609 27.2H6.39l-1.644 7.81a.675.675 0 0 0 .66.815h29.187a.675.675 0 0 0 .66-.814L33.61 27.2ZM6.593 4.836c0-.373.302-.675.675-.675h25.464c.372 0 .675.302.675.675V23.7H6.593V4.836Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop40;
