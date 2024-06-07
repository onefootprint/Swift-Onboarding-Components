import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoGreenCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.241 6.23a.491.491 0 0 0-.491.491v10.552c0 .271.22.492.491.492H19.76c.271 0 .491-.22.491-.492V6.721a.491.491 0 0 0-.491-.491H4.24Zm-1.991.491c0-1.1.892-1.991 1.991-1.991H19.76c1.1 0 1.991.892 1.991 1.991v10.552c0 1.1-.892 1.992-1.991 1.992H4.24c-1.1 0-1.991-.892-1.991-1.992V6.721Zm5.384 2.302a1.422 1.422 0 1 0 0 2.845 1.422 1.422 0 0 0 0-2.845Zm-2.922 1.422a2.922 2.922 0 1 1 5.845 0 2.922 2.922 0 0 1-5.845 0Zm7.848 0a.75.75 0 0 1 .75-.75h3.966a.75.75 0 0 1 0 1.5H13.31a.75.75 0 0 1-.75-.75Zm1.403 3.725a.75.75 0 0 1 .75-.75h2.563a.75.75 0 0 1 0 1.5h-2.563a.75.75 0 0 1-.75-.75Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGreenCard24;
