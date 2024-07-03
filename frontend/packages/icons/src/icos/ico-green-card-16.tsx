import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoGreenCard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.793 3.48a.293.293 0 0 0-.293.293v8.442c0 .162.131.293.293.293h12.414a.293.293 0 0 0 .293-.293V3.773a.293.293 0 0 0-.293-.293H1.793ZM.1 3.773c0-.935.758-1.693 1.693-1.693h12.414c.935 0 1.693.758 1.693 1.693v8.442c0 .935-.758 1.693-1.693 1.693H1.793A1.693 1.693 0 0 1 .1 12.215V3.773Zm4.408 1.942a1.038 1.038 0 1 0 0 2.076 1.038 1.038 0 0 0 0-2.076ZM2.07 6.753a2.438 2.438 0 1 1 4.875 0 2.438 2.438 0 0 1-4.875 0Zm6.279 0a.7.7 0 0 1 .7-.7h3.172a.7.7 0 1 1 0 1.4H9.049a.7.7 0 0 1-.7-.7ZM9.47 9.732a.7.7 0 0 1 .7-.7h2.05a.7.7 0 1 1 0 1.4h-2.05a.7.7 0 0 1-.7-.7Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGreenCard16;
