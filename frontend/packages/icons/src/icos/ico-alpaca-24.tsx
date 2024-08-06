import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoAlpaca24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m9.98 18.548.527-5.637h-.048c-.423 0-.772-.152-1.094-.43a1.81 1.81 0 0 1-.602-1.088l.996-.654v-.008c0-.445.17-.874.473-1.195a1.693 1.693 0 0 1 1.157-.532v-.002h.296V7.95c.21 0 .413.075.574.213.16.137.268.328.303.539h.012V7.95a.88.88 0 0 1 .775.46.913.913 0 0 1-.016.912c.267.178.487.42.64.706.151.285.23.604.23.929v6.803c0 .1.04.195.11.266.069.07.163.11.261.11h.44a6.552 6.552 0 0 1-1.999.65c3.2-.495 5.652-3.3 5.652-6.687 0-3.737-2.985-6.766-6.667-6.766S5.333 8.363 5.333 12.1c0 3.022 1.952 5.58 4.646 6.45Zm.783-7.643a.209.209 0 0 0-.06.146l-.018.207h.407a.405.405 0 0 0 .288-.121.417.417 0 0 0 .12-.293h-.593a.202.202 0 0 0-.144.06Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoAlpaca24;
