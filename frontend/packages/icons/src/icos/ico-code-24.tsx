import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.293 4.75A2.543 2.543 0 0 0 4.75 7.293v9.414a2.543 2.543 0 0 0 2.543 2.543h9.414a2.543 2.543 0 0 0 2.543-2.543V7.293a2.543 2.543 0 0 0-2.543-2.543H7.293ZM6.25 7.293c0-.576.467-1.043 1.043-1.043h9.414c.576 0 1.043.467 1.043 1.043v9.414c0 .576-.467 1.043-1.043 1.043H7.293a1.043 1.043 0 0 1-1.043-1.043V7.293Zm3.338 3.029a.75.75 0 0 0-1.004 1.115l1.623 1.46-1.623 1.46a.75.75 0 0 0 1.004 1.114l2.241-2.017a.75.75 0 0 0 0-1.115l-2.241-2.017Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCode24;
