import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWork24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.303 7.651v-1.55h-3.101v1.55h3.101ZM5.55 9.201v8.528h7.663a4.11 4.11 0 0 0 .4 1.55H5.55c-.86 0-1.55-.69-1.55-1.55l.008-8.527c0-.861.682-1.551 1.543-1.551h3.1v-1.55c0-.861.69-1.551 1.551-1.551h3.101c.86 0 1.55.69 1.55 1.55v1.551h3.101c.861 0 1.551.69 1.551 1.55v4.765a4.107 4.107 0 0 0-1.55-.565V9.2H5.55Zm14.276 7.338a.59.59 0 1 0-.835-.835l-2.32 2.32-.98-.979a.59.59 0 1 0-.835.836l1.397 1.396a.591.591 0 0 0 .835 0l2.738-2.738Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWork24;
