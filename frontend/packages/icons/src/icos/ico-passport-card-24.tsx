import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassportCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.688 6.688a.5.5 0 0 1 .5-.5h15.625a.5.5 0 0 1 .5.5v10.625a.5.5 0 0 1-.5.5H4.188a.5.5 0 0 1-.5-.5V6.688Zm.5-2a2 2 0 0 0-2 2v10.625a2 2 0 0 0 2 2h15.625a2 2 0 0 0 2-2V6.688a2 2 0 0 0-2-2H4.188Zm6.326 5.821a1.486 1.486 0 1 1 2.972 0 1.486 1.486 0 0 1-2.972 0ZM12 7.523a2.986 2.986 0 1 0 0 5.972 2.986 2.986 0 0 0 0-5.972Zm-2.236 7.454a.75.75 0 0 0 0 1.5h4.472a.75.75 0 0 0 0-1.5H9.764Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassportCard24;
