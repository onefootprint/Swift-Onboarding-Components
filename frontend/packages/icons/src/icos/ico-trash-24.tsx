import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoTrash24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.25 5.5c-.69 0-1.25.56-1.25 1.25V7h4v-.25c0-.69-.56-1.25-1.25-1.25h-1.5ZM15.5 7v-.25A2.75 2.75 0 0 0 12.75 4h-1.5A2.75 2.75 0 0 0 8.5 6.75V7H5.25a.75.75 0 0 0 0 1.5h.312l.782 8.988A2.75 2.75 0 0 0 9.084 20h5.832a2.75 2.75 0 0 0 2.74-2.512l.782-8.988h.312a.75.75 0 0 0 0-1.5H15.5Zm1.432 1.5H7.068l.77 8.858A1.25 1.25 0 0 0 9.084 18.5h5.832a1.25 1.25 0 0 0 1.246-1.142l.77-8.858ZM10.25 10a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75Zm4.25.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoTrash24;
