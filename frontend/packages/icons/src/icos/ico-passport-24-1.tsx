import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport241 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 1 1"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.167 5.125c0-.345.28-.625.625-.625h9.375a2.41 2.41 0 0 1 2.41 2.41v9.376a2.41 2.41 0 0 1-2.41 2.41H6.79a.625.625 0 0 1-.625-.625V5.125Zm1.25.625v11.696h8.75c.64 0 1.16-.52 1.16-1.16V6.91c0-.641-.52-1.161-1.16-1.161h-8.75Zm4.954 2.679a1.384 1.384 0 1 0 0 2.767 1.384 1.384 0 0 0 0-2.767ZM9.738 9.813a2.634 2.634 0 1 1 5.268 0 2.634 2.634 0 0 1-5.268 0Zm.625 4.062a.625.625 0 1 0 0 1.25h4.018a.625.625 0 0 0 0-1.25h-4.018Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassport241;
