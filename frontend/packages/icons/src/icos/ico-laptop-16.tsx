import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLaptop16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.407.95c-.87 0-1.575.705-1.575 1.575v7.438c0 .036.003.072.008.107l-.646 3.068c-.206.979.541 1.9 1.542 1.9h10.53c1 0 1.748-.921 1.541-1.9l-.645-3.068a.714.714 0 0 0 .008-.107V2.525c0-.87-.705-1.575-1.575-1.575H3.407Zm9.449 9.713h-9.71l-.582 2.764a.175.175 0 0 0 .172.21h10.53a.175.175 0 0 0 .172-.21l-.582-2.764ZM3.232 2.524c0-.097.079-.175.175-.175h9.188c.096 0 .175.078.175.175v6.738H3.232V2.525Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop16;
