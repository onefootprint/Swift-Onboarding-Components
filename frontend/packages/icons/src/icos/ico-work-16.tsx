import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.188 3.753V2.26H6.205v1.492h2.983ZM1.73 5.243v8.203h7.37c.03.531.165 1.035.385 1.491H1.73A1.486 1.486 0 0 1 .24 13.446l.007-8.202a1.48 1.48 0 0 1 1.484-1.491h2.983V2.26c0-.827.663-1.491 1.491-1.491h2.983c.827 0 1.49.664 1.49 1.491v1.492h2.983c.828 0 1.492.663 1.492 1.49v4.584a3.952 3.952 0 0 0-1.492-.544v-4.04H1.731Zm13.824 7.151a.7.7 0 0 0-.99-.99l-2.139 2.139-.848-.848a.7.7 0 0 0-.99.99l1.343 1.343a.7.7 0 0 0 .99 0l2.634-2.634Z"
          fill={theme.color[color]}
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
export default IcoWork16;
