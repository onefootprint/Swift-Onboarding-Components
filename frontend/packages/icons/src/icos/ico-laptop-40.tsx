import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
        d="M8.652 2.58A3.912 3.912 0 0 0 4.74 6.491v18.373c0 .09.007.179.02.265l-1.595 7.576a3.912 3.912 0 0 0 3.828 4.717h26.014a3.912 3.912 0 0 0 3.828-4.717l-1.595-7.577c.013-.086.02-.174.02-.264V6.491a3.912 3.912 0 0 0-3.912-3.911H8.652Zm23.324 24.035H8.024l-1.434 6.81a.412.412 0 0 0 .403.497h26.014c.262 0 .457-.24.403-.496l-1.434-6.812ZM8.24 6.49c0-.227.185-.411.412-.411h22.696c.227 0 .412.184.412.411v16.623H8.24V6.491Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop40;
