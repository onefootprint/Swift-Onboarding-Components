import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPassport161 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M1.83 1.66a.7.7 0 0 1 .7-.7h9.188a2.45 2.45 0 0 1 2.45 2.45v9.188a2.45 2.45 0 0 1-2.45 2.45H2.53a.7.7 0 0 1-.7-.7V1.66Zm1.4.7v11.288h8.488c.58 0 1.05-.47 1.05-1.05V3.41c0-.58-.47-1.05-1.05-1.05H3.23Zm4.269 2.625a1.269 1.269 0 1 0 0 2.538 1.269 1.269 0 0 0 0-2.538ZM4.83 6.254a2.669 2.669 0 1 1 5.337 0 2.669 2.669 0 0 1-5.337 0Zm.7 3.894a.7.7 0 1 0 0 1.4h3.937a.7.7 0 1 0 0-1.4H5.53Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPassport161;
