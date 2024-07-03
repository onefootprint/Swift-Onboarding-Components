import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.75 6.721c0-.271.22-.491.491-.491H19.76c.271 0 .491.22.491.491v10.552c0 .271-.22.492-.491.492h-7.106c-.288-.935-.723-1.924-1.273-2.715-.284-.408-.636-.818-1.054-1.124a2.921 2.921 0 0 0-1.43-5.472 2.922 2.922 0 0 0-1.43 5.472c-.417.306-.77.716-1.053 1.124-.55.791-.985 1.78-1.274 2.715h-.898a.491.491 0 0 1-.491-.492V6.721Zm6.398 9.185c.363.522.681 1.182.925 1.859H6.72c.243-.677.561-1.337.924-1.859.508-.732.954-.986 1.252-.986.297 0 .743.255 1.251.986ZM4.241 4.73c-1.1 0-1.991.892-1.991 1.991v10.552c0 1.1.892 1.992 1.991 1.992H19.76c1.1 0 1.991-.892 1.991-1.992V6.721c0-1.1-.892-1.991-1.991-1.991H4.24Zm3.233 6.646a1.422 1.422 0 1 1 2.845 0 1.422 1.422 0 0 1-2.845 0Zm7.94-1.68a.75.75 0 0 0 0 1.5h1.862a.75.75 0 0 0 0-1.5h-1.862Zm0 3.724a.75.75 0 0 0 0 1.5h1.862a.75.75 0 0 0 0-1.5h-1.862Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdCard24;
