import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEyeCrossed16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M7.06 2.647a.75.75 0 1 0 .203 1.487L7.06 2.647Zm7.272 4.75.644-.384-.644.384Zm-1.385 1.898a.75.75 0 0 0 1.173.935l-1.173-.935Zm1.385-.692.644.383-.644-.383ZM2.53 1.47a.75.75 0 0 0-1.06 1.06l1.06-1.06Zm4.056 5.116.53-.53-.53.53Zm6.884 7.944a.75.75 0 1 0 1.06-1.06l-1.06 1.06ZM1.668 7.397l-.644-.384.644.384Zm3.17-2.34a.75.75 0 0 0-.819-1.256l.82 1.256Zm-3.17 3.547.645-.384-.644.384ZM11.982 12.2a.75.75 0 0 0-.82-1.256l.82 1.256ZM7.263 4.134c2.278-.312 4.746.826 6.424 3.646l1.29-.767c-1.93-3.24-4.939-4.773-7.917-4.366l.203 1.487Zm6.857 6.096c.304-.382.59-.797.857-1.244l-1.29-.767c-.232.391-.48.75-.74 1.076l1.173.935Zm-.433-2.45c.081.136.081.304 0 .44l1.29.766a1.929 1.929 0 0 0 0-1.973l-1.29.767ZM8 9.25c-.69 0-1.25-.56-1.25-1.25h-1.5A2.75 2.75 0 0 0 8 10.75v-1.5ZM1.47 2.53l4.585 4.586 1.061-1.06L2.53 1.47 1.47 2.53ZM6.75 8c0-.345.14-.657.366-.884l-1.06-1.06A2.744 2.744 0 0 0 5.25 8h1.5Zm-.695-.884 2.829 2.829 1.06-1.061-2.828-2.829-1.06 1.061Zm2.829 2.829 4.586 4.585 1.06-1.06-4.585-4.586-1.061 1.06Zm0-1.061A1.244 1.244 0 0 1 8 9.25v1.5c.76 0 1.448-.309 1.945-.805L8.884 8.884ZM1.47 2.53l12 12 1.06-1.06-12-12-1.06 1.06Zm.843 5.25c.723-1.214 1.594-2.116 2.525-2.723L4.02 3.801c-1.143.745-2.168 1.822-2.995 3.212l1.289.768ZM1.024 8.989c1.308 2.196 3.11 3.612 5.082 4.166 1.976.555 4.062.227 5.875-.955l-.82-1.256c-1.465.955-3.106 1.2-4.649.767-1.547-.435-3.057-1.571-4.199-3.49l-1.289.768Zm0-1.975a1.93 1.93 0 0 0 0 1.975l1.29-.768a.43.43 0 0 1-.001-.44l-1.29-.767Z"
          fill={theme.color[color]}
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
export default IcoEyeCrossed16;
