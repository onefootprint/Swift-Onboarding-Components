import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMessage24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.5 12c0-2.01.822-3.347 2.004-4.206C8.716 6.912 10.36 6.5 12 6.5c1.64 0 3.284.412 4.496 1.294C17.678 8.654 18.5 9.99 18.5 12c0 2.01-.822 3.347-2.004 4.206C15.284 17.088 13.64 17.5 12 17.5a9.45 9.45 0 0 1-1.475-.114 2.99 2.99 0 0 0-1.02.006l-3.207.602a.25.25 0 0 1-.292-.292l.263-1.399c.133-.712-.043-1.393-.296-1.946C5.677 13.711 5.5 12.932 5.5 12ZM12 5c-1.86 0-3.841.463-5.379 1.58C5.053 7.723 4 9.51 4 12c0 1.127.215 2.12.61 2.981.176.387.241.742.184 1.046l-.262 1.398a1.75 1.75 0 0 0 2.043 2.043l3.207-.602c.153-.028.324-.028.508.001.568.09 1.143.133 1.71.133 1.86 0 3.841-.463 5.379-1.58C18.947 16.277 20 14.49 20 12c0-2.49-1.053-4.278-2.621-5.42C15.84 5.464 13.859 5 12 5Zm-3 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm2 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm4-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMessage24;
