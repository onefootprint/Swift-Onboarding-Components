import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoClipboard16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M10.833 3.167h2c.368 0 .667.298.667.666V13.5a.667.667 0 0 1-.667.667H3.167A.667.667 0 0 1 2.5 13.5V3.833c0-.368.298-.666.667-.666h2m.666 1.666h4.334a.667.667 0 0 0 .666-.666V2.5a.667.667 0 0 0-.666-.667H5.833a.667.667 0 0 0-.666.667v1.667c0 .368.298.666.666.666Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoClipboard16;
