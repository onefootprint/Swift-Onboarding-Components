import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoApple24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M18.868 15.739c-.375.833-.555 1.205-1.038 1.94-.675 1.027-1.627 2.31-2.804 2.318-1.047.01-1.318-.683-2.74-.671-1.422.007-1.718.685-2.767.674-1.178-.011-2.078-1.166-2.754-2.192-1.888-2.876-2.088-6.248-.92-8.042.825-1.271 2.13-2.019 3.358-2.019 1.25 0 2.035.686 3.068.686 1.002 0 1.612-.687 3.058-.687 1.092 0 2.247.595 3.073 1.622-2.7 1.481-2.262 5.338.466 6.371Zm-4.637-9.141c.526-.675.925-1.628.78-2.598-.857.058-1.86.606-2.445 1.315-.532.647-.972 1.606-.8 2.534.935.03 1.904-.528 2.465-1.251Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoApple24;
