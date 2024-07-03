import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWorld16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.001 2.45c-.582 0-1.144.09-1.671.256V5.63a3.287 3.287 0 0 1-3.287 3.287h-.518a5.559 5.559 0 0 0 3.22 4.157 6.88 6.88 0 0 0 .479-2.487c0-.615.18-1.084.53-1.444.253-.26.588-.444.827-.574l.108-.06c.273-.153.497-.3.69-.531.19-.229.385-.585.511-1.201l1.948-.668c-.273.198-.49.528-.576.949-.164.8-.445 1.379-.807 1.815-.359.432-.763.679-1.08.857l-.154.086c-.248.138-.368.204-.462.302-.058.06-.136.159-.136.47a8.28 8.28 0 0 1-.533 2.89 5.55 5.55 0 0 0 6.05-7.579h-1.69c-.214 0-.426.074-.612.21l-1.948.668c.238-1.158 1.182-2.278 2.56-2.278h.858A5.54 5.54 0 0 0 8.001 2.45Zm2.837 3.659.612-.21-.612.21ZM2.47 7.517a5.548 5.548 0 0 1 2.459-4.14V5.63a1.887 1.887 0 0 1-1.887 1.887h-.572ZM1.05 8a6.951 6.951 0 1 1 13.902 0 6.951 6.951 0 0 1-13.902 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWorld16;
