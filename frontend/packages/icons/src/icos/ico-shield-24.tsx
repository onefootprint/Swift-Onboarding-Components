import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShield24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.307 4.066a.75.75 0 0 0-.614 0l-7.25 3.25a.75.75 0 0 0-.441.634L4.75 8l-.748-.05v.004L4 7.962l-.002.029a14.072 14.072 0 0 0-.016.48c-.005.322-.003.779.026 1.326.056 1.089.218 2.556.645 4.036.426 1.475 1.131 3.013 2.308 4.19C8.158 19.219 9.802 20 12 20c2.198 0 3.842-.781 5.038-1.977 1.177-1.177 1.881-2.715 2.308-4.19.427-1.48.589-2.947.645-4.036a19.8 19.8 0 0 0 .015-1.703A9.307 9.307 0 0 0 20 7.991l-.002-.029v-.011L19.25 8l.748-.05a.75.75 0 0 0-.441-.634l-7.25-3.25Zm-6.824 4.43v-.003L12 5.572l6.517 2.921v.002c.004.294.003.716-.024 1.224-.053 1.02-.203 2.365-.588 3.698-.387 1.338-.995 2.612-1.928 3.545-.913.913-2.175 1.538-3.977 1.538s-3.064-.625-3.977-1.538c-.933-.933-1.54-2.207-1.927-3.545-.385-1.333-.536-2.678-.59-3.698-.026-.508-.027-.93-.023-1.224Zm9.375 1.693a.75.75 0 0 0-1.216-.878l-2.684 3.717-.632-.758a.75.75 0 0 0-1.152.96l1.25 1.5a.75.75 0 0 0 1.184-.04l3.25-4.5Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoShield24;
