import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUser24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0ZM12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM6.024 17.609a4.783 4.783 0 0 1 1.81-1.893c.919-.548 2.245-.966 4.168-.966 1.922 0 3.249.418 4.167.966a4.784 4.784 0 0 1 1.81 1.893c.12.226.082.404-.04.557-.14.177-.421.334-.785.334H6.848c-.363 0-.644-.157-.785-.334-.122-.153-.16-.331-.04-.557Zm5.978-4.359c-2.146 0-3.748.469-4.936 1.178a6.283 6.283 0 0 0-2.368 2.48c-.414.784-.279 1.6.192 2.192.451.566 1.18.9 1.96.9h10.304c.779 0 1.508-.334 1.96-.9.47-.591.605-1.408.192-2.192a6.282 6.282 0 0 0-2.368-2.48c-1.19-.71-2.791-1.178-4.936-1.178Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUser24;
