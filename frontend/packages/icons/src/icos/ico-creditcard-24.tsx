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
        d="M5.75 7.833c0-.69.56-1.25 1.25-1.25h9.844c.69 0 1.25.56 1.25 1.25v1.72H5.75v-1.72Zm0 2.97v5c0 .69.56 1.25 1.25 1.25h9.844c.69 0 1.25-.56 1.25-1.25v-5H5.75ZM7 5.332a2.5 2.5 0 0 0-2.5 2.5v7.97a2.5 2.5 0 0 0 2.5 2.5h9.844a2.5 2.5 0 0 0 2.5-2.5v-7.97a2.5 2.5 0 0 0-2.5-2.5H7Zm.313 8.594c0-.345.28-.625.625-.625h2.343a.625.625 0 1 1 0 1.25H7.937a.625.625 0 0 1-.625-.625Zm8.125-.625a.625.625 0 1 0 0 1.25h.468a.625.625 0 0 0 0-1.25h-.469Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCreditcard24;
