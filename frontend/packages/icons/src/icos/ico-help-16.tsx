import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoHelp16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.45 8.094a5.62 5.62 0 0 1 1.189-3.465l1.503 1.503a3.527 3.527 0 0 0-.592 1.962c0 .725.218 1.4.592 1.962L3.64 11.559A5.62 5.62 0 0 1 2.45 8.094Zm3.682-2.952L4.629 3.639A5.62 5.62 0 0 1 8.094 2.45a5.62 5.62 0 0 1 3.465 1.189l-1.503 1.503a3.527 3.527 0 0 0-1.962-.592c-.726 0-1.4.218-1.962.592Zm4.913.99c.374.562.592 1.236.592 1.962 0 .725-.218 1.4-.592 1.962l1.504 1.503a5.62 5.62 0 0 0 1.189-3.465 5.62 5.62 0 0 0-1.19-3.465l-1.503 1.503Zm-.99 4.913a3.527 3.527 0 0 1-1.961.592c-.726 0-1.4-.218-1.962-.592L4.629 12.55a5.62 5.62 0 0 0 3.465 1.189 5.62 5.62 0 0 0 3.465-1.19l-1.503-1.503ZM8.095 1.05a7.044 7.044 0 1 0 0 14.087 7.044 7.044 0 0 0 0-14.087ZM5.95 8.094a2.144 2.144 0 1 1 4.288 0 2.144 2.144 0 0 1-4.288 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoHelp16;
