import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEnter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.387 5.002a.676.676 0 0 0-.07.017.543.543 0 0 0-.437.538v6.448c0 1.49-1.246 2.687-2.798 2.687H6.93l2.396-2.3a.52.52 0 0 0 .12-.63.564.564 0 0 0-.592-.295.574.574 0 0 0-.333.152l-3.27 3.157a.53.53 0 0 0-.193.201.24.24 0 0 0-.017.034v.017a.246.246 0 0 0-.018.033.54.54 0 0 0-.017.235V15.347c.004.01.01.023.017.033v.017c.004.01.011.023.018.034.004.01.01.023.017.033v.017c.02.036.044.07.07.1a.26.26 0 0 0 .087.068l3.306 3.19a.584.584 0 0 0 .805 0 .53.53 0 0 0 0-.772l-2.396-2.3h8.15c2.159 0 3.919-1.69 3.919-3.762V5.557a.524.524 0 0 0-.175-.41.574.574 0 0 0-.438-.145Z"
        fill={theme.color[color]}
        stroke={theme.color[color]}
        strokeWidth={0.5}
      />
    </svg>
  );
};
export default IcoEnter24;
