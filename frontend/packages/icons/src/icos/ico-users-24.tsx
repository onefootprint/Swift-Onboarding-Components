import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUsers24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.532 5.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3.5 2a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Zm-.38 10.878c.144-.707.442-1.63 1.038-2.364.57-.702 1.438-1.264 2.842-1.264 1.404 0 2.272.562 2.842 1.264.596.733.894 1.657 1.038 2.364a.078.078 0 0 1 0 .038.074.074 0 0 1-.017.03.193.193 0 0 1-.145.054H5.814a.193.193 0 0 1-.145-.055.074.074 0 0 1-.017-.029.078.078 0 0 1 0-.038Zm3.88-5.128c-1.885 0-3.17.789-4.007 1.819-.811 1-1.176 2.19-1.342 3.01C3.96 19.17 4.852 20 5.813 20h7.437c.963 0 1.853-.83 1.632-1.92-.167-.82-.532-2.012-1.343-3.011-.837-1.03-2.122-1.819-4.007-1.819Zm6.25 0a.75.75 0 0 0 0 1.5c.732 0 1.258.36 1.675.95.432.613.704 1.425.867 2.159a.468.468 0 0 1-.11.429.671.671 0 0 1-.505.212h-.927a.75.75 0 0 0 0 1.5h.927c1.252 0 2.386-1.084 2.08-2.467-.182-.814-.508-1.85-1.107-2.698-.614-.87-1.553-1.585-2.9-1.585Zm-1-9.25a.75.75 0 0 0 0 1.5c1.013 0 1.75.798 1.75 2s-.737 2-1.75 2a.75.75 0 0 0 0 1.5c2.024 0 3.25-1.665 3.25-3.5S16.806 4 14.782 4Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUsers24;
