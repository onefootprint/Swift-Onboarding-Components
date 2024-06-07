import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoBroadcast16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.809 2.815a.7.7 0 0 1 0 .99 5.937 5.937 0 0 0 0 8.396.7.7 0 1 1-.99.99 7.337 7.337 0 0 1 0-10.376.7.7 0 0 1 .99 0Zm8.395 0a.7.7 0 0 1 .99 0 7.336 7.336 0 0 1 0 10.375.7.7 0 1 1-.99-.99 5.937 5.937 0 0 0 0-8.395.7.7 0 0 1 0-.99Zm-.951 1.942a.7.7 0 0 0-.99.99 3.19 3.19 0 0 1 0 4.512.7.7 0 0 0 .99.99 4.59 4.59 0 0 0 0-6.492Zm-5.502 0a.7.7 0 0 1 0 .99 3.19 3.19 0 0 0 0 4.512.7.7 0 0 1-.99.99 4.59 4.59 0 0 1 0-6.492.7.7 0 0 1 .99 0Zm2.298 3.246a.042.042 0 1 1-.085 0 .042.042 0 0 1 .085 0Zm-.042-.958a.958.958 0 1 0 0 1.916.958.958 0 0 0 0-1.916Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBroadcast16;
