import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoServer24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6 6.181c0-.1.081-.181.181-.181h9.027v3.621H6.18A.181.181 0 0 1 6 9.44V6.18Zm10.708 3.44V6h1.112c.1 0 .18.081.18.181V9.44c0 .1-.08.181-.18.181h-1.112ZM6.18 4.5c-.928 0-1.681.753-1.681 1.681V9.44c0 .928.753 1.681 1.681 1.681H17.82c.928 0 1.68-.753 1.68-1.681V6.18c0-.928-.752-1.681-1.68-1.681H6.18ZM6 14.561c0-.1.081-.181.181-.181h9.027V18H6.18A.181.181 0 0 1 6 17.82V14.56Zm10.708 3.44h1.112c.1 0 .18-.081.18-.181V14.56c0-.1-.08-.181-.18-.181h-1.112V18ZM6.18 12.88c-.928 0-1.681.752-1.681 1.681v3.259c0 .928.753 1.68 1.681 1.68H17.82c.928 0 1.68-.752 1.68-1.68V14.56c0-.928-.752-1.681-1.68-1.681H6.18Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoServer24;
