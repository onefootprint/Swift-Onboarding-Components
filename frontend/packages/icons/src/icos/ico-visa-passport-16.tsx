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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M6.333 10.667h3.334m-6 3h8.666A.667.667 0 0 0 13 13V3a.667.667 0 0 0-.667-.667H3.667A.667.667 0 0 0 3 3v10c0 .368.298.667.667.667Z"
          strokeWidth={1.333}
        />
        <path d="m8.073 4.607.47.723.832-.223-.105.855.781.364-.63.588.364.781-.86.045-.223.833-.689-.52-.706.496-.193-.84-.86-.075.392-.768-.61-.61.794-.336-.075-.859.824.252.494-.706Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoVisaPassport16;
