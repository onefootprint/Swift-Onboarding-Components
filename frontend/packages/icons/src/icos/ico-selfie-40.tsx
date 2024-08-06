import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSelfie40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      viewBox="0 0 40 40"
    >
      <path
        d="M13.333 33.333h-5c-.92 0-1.667-.746-1.667-1.666v-5m20 6.666h5c.921 0 1.667-.746 1.667-1.666v-5M6.667 13.333v-5c0-.92.746-1.666 1.666-1.666h5m13.333 0h5c.921 0 1.667.746 1.667 1.666v5M13.334 23.333v-6.666c0-.92.746-1.667 1.666-1.667h.976c.443 0 .867-.176 1.179-.488l.69-.69a1.667 1.667 0 0 1 1.179-.489h1.953c.442 0 .866.176 1.178.489l.69.69c.313.312.737.488 1.179.488H25c.92 0 1.667.746 1.667 1.667v6.666c0 .92-.746 1.667-1.667 1.667H15c-.92 0-1.666-.746-1.666-1.667Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19.75v-.017m.833.017a.833.833 0 1 1-1.667 0 .833.833 0 0 1 1.667 0Z"
        stroke={theme.color[color]}
        strokeWidth={3.333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSelfie40;
