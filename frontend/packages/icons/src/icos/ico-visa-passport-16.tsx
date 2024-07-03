import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoVisaPassport16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.23 1.52a.75.75 0 0 1 .75-.75h9.383A2.537 2.537 0 0 1 13.9 3.307v6.268a3.56 3.56 0 0 0-1.5-.331V3.307c0-.573-.465-1.037-1.037-1.037H2.73v11.457h6.208c.15.567.434 1.08.817 1.5H1.98a.75.75 0 0 1-.75-.75V1.52Zm8.693 8.718c-.406.389-.72.872-.907 1.415H5.554a.75.75 0 1 1 0-1.5h4.021c.126 0 .244.03.348.085ZM7.565 4.9a1.31 1.31 0 1 0 0 2.62 1.31 1.31 0 0 0 0-2.62Zm-2.71 1.31a2.71 2.71 0 1 1 5.42 0 2.71 2.71 0 0 1-5.42 0Zm9.746 5.841a.59.59 0 1 0-.835-.835l-1.95 1.95-.79-.79a.59.59 0 1 0-.835.835L11.4 14.42a.59.59 0 0 0 .835 0l2.367-2.367Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVisaPassport16;
