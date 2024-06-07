import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoGlobe24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.47 5.806c.299-.269.484-.306.53-.306.046 0 .231.037.53.306.281.256.599.663.897 1.23.524.996.957 2.425 1.053 4.214H9.52c.096-1.789.53-3.218 1.053-4.213.298-.568.616-.975.898-1.23ZM8.019 11.25c.098-2.02.585-3.69 1.227-4.912.055-.103.11-.205.168-.303a6.506 6.506 0 0 0-3.87 5.215h2.475Zm-2.475 1.5h2.475c.098 2.02.585 3.69 1.227 4.912.055.104.11.205.168.303a6.506 6.506 0 0 1-3.87-5.215Zm3.977 0h4.96c-.096 1.789-.53 3.218-1.053 4.213-.298.568-.616.975-.898 1.23-.298.27-.483.307-.529.307-.046 0-.231-.037-.53-.306-.281-.256-.599-.663-.897-1.23-.524-.996-.957-2.425-1.053-4.214Zm6.462 0c-.098 2.02-.585 3.69-1.227 4.912-.055.104-.11.205-.168.303a6.506 6.506 0 0 0 3.87-5.215h-2.475Zm2.475-1.5a6.506 6.506 0 0 0-3.87-5.215c.057.098.113.2.168.303.642 1.222 1.13 2.892 1.227 4.912h2.475ZM20 12a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoGlobe24;
