import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCreditcard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.875 7.833c0-.621.504-1.125 1.125-1.125h9.844c.621 0 1.125.504 1.125 1.125v1.594H5.875V7.833Zm0 3.094v4.875c0 .621.504 1.125 1.125 1.125h9.844c.621 0 1.125-.504 1.125-1.125v-4.875H5.875ZM7 5.208a2.625 2.625 0 0 0-2.625 2.625v7.97A2.625 2.625 0 0 0 7 18.426h9.844a2.625 2.625 0 0 0 2.625-2.625V7.833a2.625 2.625 0 0 0-2.625-2.625H7Zm.188 8.72a.75.75 0 0 1 .75-.75h2.343a.75.75 0 1 1 0 1.5H7.937a.75.75 0 0 1-.75-.75Zm8.25-.75a.75.75 0 0 0 0 1.5h.468a.75.75 0 1 0 0-1.5h-.469Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCreditcard24;
