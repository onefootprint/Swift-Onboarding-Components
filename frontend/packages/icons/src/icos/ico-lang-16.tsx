import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLang16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m11.344 6-3.656 9h1.476l.765-1.813h2.83L13.523 15H15l-3.656-9Zm-.834 5.813.834-2.568.834 2.568H10.51ZM8.5 10.5a12.446 12.446 0 0 1-1.42-1.333c1.238-1.677 1.938-3.582 2.224-4.48H11V3.313H6.687V2H5.313v1.313H1v1.374h6.852c-.298.843-.846 2.172-1.681 3.387-1.022-1.358-1.474-2.372-1.48-2.382L4.47 5.25l-1.188.688.215.433c.028.048.537 1.184 1.71 2.705.028.038.057.075.087.111-1.554 1.777-2.786 2.472-2.802 2.484L2 12l.719 1.125.603-.358c.069-.053 1.291-.75 2.875-2.525.766.821 1.35 1.276 1.384 1.302l.388.268L8.5 10.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLang16;
