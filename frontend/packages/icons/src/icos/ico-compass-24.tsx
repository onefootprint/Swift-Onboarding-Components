import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCompass24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M15.721 16.294a.833.833 0 0 0 .572-.572l3-10.5a.417.417 0 0 0-.515-.516l-10.5 3a.833.833 0 0 0-.572.572l-3 10.5c-.09.315.2.606.515.516l10.5-3Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
      />
      <path
        d="M13.666 12a1.667 1.667 0 1 1-3.333 0 1.667 1.667 0 0 1 3.333 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
      />
    </svg>
  );
};
export default IcoCompass24;
