import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoTrash16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.35 2.35c-.58 0-1.05.47-1.05 1.05v.175h3.412V3.4c0-.58-.47-1.05-1.05-1.05H7.35Zm3.763 1.225V3.4A2.45 2.45 0 0 0 8.663.95H7.35A2.45 2.45 0 0 0 4.9 3.4v.175H2.1a.7.7 0 1 0 0 1.4h.233l.68 7.825a2.45 2.45 0 0 0 2.441 2.237h5.104a2.45 2.45 0 0 0 2.44-2.237l.681-7.825h.233a.7.7 0 1 0 0-1.4h-2.8Zm1.161 1.4H3.739l.67 7.704a1.05 1.05 0 0 0 1.045.958h5.104a1.05 1.05 0 0 0 1.046-.959l.67-7.703ZM6.475 6.2a.7.7 0 0 1 .7.7v4.813a.7.7 0 1 1-1.4 0V6.9a.7.7 0 0 1 .7-.7Zm3.763.7a.7.7 0 0 0-1.4 0v4.813a.7.7 0 1 0 1.4 0V6.9Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTrash16;
