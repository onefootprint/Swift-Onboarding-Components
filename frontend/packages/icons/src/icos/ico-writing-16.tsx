import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWriting16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.337 2.45A1.887 1.887 0 0 0 2.45 4.337v7.329c0 1.041.845 1.886 1.887 1.886H9.94a1.887 1.887 0 0 0 1.887-1.886v-.432a.7.7 0 1 1 1.4 0v.431a3.287 3.287 0 0 1-3.287 3.287H4.337a3.287 3.287 0 0 1-3.287-3.287V4.337A3.287 3.287 0 0 1 4.337 1.05h2.155a.7.7 0 1 1 0 1.4H4.337Zm6.853-.754a2.204 2.204 0 1 1 3.117 3.116l-2.831 2.831a2.536 2.536 0 0 1-1.178.667l-2.343.586a.7.7 0 0 1-.849-.85l.586-2.342c.112-.446.342-.853.667-1.178l2.83-2.83Zm2.127.99a.804.804 0 0 0-1.137 0l-2.831 2.83a1.136 1.136 0 0 0-.299.528l-.302 1.21 1.21-.302c.2-.05.382-.153.528-.299l2.83-2.83a.804.804 0 0 0 0-1.138Zm-8.98 7.417a.7.7 0 1 0 0 1.4H9.94a.7.7 0 0 0 0-1.4H4.337Zm-.7-1.886a.7.7 0 0 1 .7-.7H5.63a.7.7 0 1 1 0 1.4H4.337a.7.7 0 0 1-.7-.7Zm.7-3.287a.7.7 0 1 0 0 1.4H5.63a.7.7 0 1 0 0-1.4H4.337Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWriting16;
