import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBank24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.833 9.5v6.667m-3.333 0V9.5m-8.333 0v6.667m3.333 0V9.5M4.96 7.603l6.667-3.333a.833.833 0 0 1 .746 0l6.666 3.333c.283.141.461.43.461.745v.319c0 .46-.373.833-.833.833H5.333a.833.833 0 0 1-.833-.833v-.319c0-.315.178-.604.46-.745Zm.696 11.064h12.688c.569 0 .97-.558.79-1.097l-.277-.834a.833.833 0 0 0-.791-.57H5.934a.833.833 0 0 0-.79.57l-.278.834a.833.833 0 0 0 .79 1.097Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="square"
      />
    </svg>
  );
};
export default IcoBank24;
