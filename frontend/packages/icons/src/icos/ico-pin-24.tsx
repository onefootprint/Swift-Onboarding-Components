import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoPin24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.75 4a.75.75 0 0 0-.712.987L8 7.872v1.617c-1.428.643-2.183 1.762-2.571 2.732a6.218 6.218 0 0 0-.422 1.84 3.878 3.878 0 0 0-.007.168V14.25l.75.001H5c0 .414.336.75.75.75h5.5v4.25a.75.75 0 0 0 1.5 0V15h5.5a.75.75 0 0 0 .75-.75h-.75.75V14.228a1.954 1.954 0 0 0-.007-.169 6.22 6.22 0 0 0-.421-1.839c-.389-.97-1.144-2.088-2.572-2.732V7.872l.962-2.885A.75.75 0 0 0 16.25 4h-8.5Zm-.929 8.778a4.637 4.637 0 0 0-.22.722H17.4a4.637 4.637 0 0 0-.221-.722c-.318-.793-.93-1.655-2.166-2.067A.75.75 0 0 1 14.5 10V7.75c0-.08.013-.16.039-.237l.67-2.013H8.791l.67 2.013a.75.75 0 0 1 .039.237V10a.75.75 0 0 1-.513.711c-1.235.412-1.848 1.274-2.166 2.067Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPin24;
