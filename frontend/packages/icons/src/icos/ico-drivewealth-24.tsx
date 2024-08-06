import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDrivewealth24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M17.034 6.027c.21-.54.801-.835 1.376-.626.54.209.853.8.644 1.358l-4.109 11.037c-.052.366-.313.68-.696.818a1.45 1.45 0 0 1-.383.053c-.122 0-.244-.018-.366-.053-.07-.034-.156-.07-.209-.104-.017-.017-.034-.018-.052-.035 0 0-.017 0-.017-.017a.954.954 0 0 1-.314-.383l-.017-.052c0-.018-.018-.035-.018-.053l-2.454-6.65-1.689 4.596a1.063 1.063 0 0 1-.696.836 1.688 1.688 0 0 1-.4.052c-.053 0-.105 0-.157-.018-.07-.017-.14-.017-.192-.034-.07-.035-.157-.07-.209-.105-.017 0-.017-.017-.035-.017-.017 0-.017-.018-.035-.018a.954.954 0 0 1-.313-.383l-.017-.052v-.017c0-.018-.018-.018-.018-.035l-2.089-5.64c-.209-.54.07-1.15.644-1.359a1.07 1.07 0 0 1 1.376.627l1.062 2.89L9.409 7.89c.157-.4.54-.679.957-.696.453-.035.906.226 1.08.696l2.455 6.65 3.133-8.513Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDrivewealth24;
