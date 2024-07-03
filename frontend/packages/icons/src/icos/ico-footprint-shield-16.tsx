import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprintShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.799 1.046a.464.464 0 0 1 .402 0l6.528 3.137c.175.084.28.264.255.457C14.758 6.41 13.382 15 8 15S1.243 6.41 1.016 4.64a.443.443 0 0 1 .255-.457L7.8 1.046Zm2.68 7.861H9.346c-.782 0-1.415.634-1.415 1.416v1.132h-1.98V4.661h4.526v1.285a1.132 1.132 0 1 0 0 1.96v1.001Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFootprintShield16;
