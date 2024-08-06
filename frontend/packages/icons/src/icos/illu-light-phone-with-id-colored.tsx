import React from 'react';
import type { IconProps } from '../types';
const IlluLightPhoneWithId = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
  return (
    <svg
      width={64}
      height={64}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={true}
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.517 37.09c0-.623.505-1.127 1.127-1.127h24.711c.623 0 1.128.505 1.128 1.127v16.804c0 .622-.505 1.127-1.127 1.127H32.784c-.45-1.535-1.157-3.179-2.055-4.47-.562-.81-1.269-1.579-2.104-2.032a4.311 4.311 0 0 0-1.568-8.325 4.31 4.31 0 0 0-1.567 8.325c-.835.453-1.542 1.221-2.105 2.031-.897 1.292-1.605 2.937-2.055 4.47h-1.686a1.127 1.127 0 0 1-1.127-1.126V37.09Zm10.816 14.43c.681.98 1.262 2.245 1.672 3.5H23.11c.41-1.255.99-2.52 1.671-3.5.823-1.184 1.623-1.719 2.276-1.719.654 0 1.454.535 2.276 1.72Zm-9.69-17.257a2.827 2.827 0 0 0-2.826 2.827v16.804a2.827 2.827 0 0 0 2.827 2.827h24.712a2.827 2.827 0 0 0 2.826-2.827V37.09a2.827 2.827 0 0 0-2.827-2.827H19.645Zm4.805 10.24a2.61 2.61 0 1 1 5.22 0 2.61 2.61 0 0 1-5.22 0Zm12.988-2.332a.85.85 0 1 0 0 1.7h2.966a.85.85 0 1 0 0-1.7h-2.966Zm0 5.93a.85.85 0 1 0 0 1.7h2.966a.85.85 0 1 0 0-1.7h-2.966Z"
        fill="#4A24DB"
      />
      <path
        d="M55.42 59.173V12.334a7.494 7.494 0 0 0-7.495-7.494h-31.85a7.494 7.494 0 0 0-7.495 7.494v46.84M27.316 16.08h9.368"
        stroke="#0E1438"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IlluLightPhoneWithId;
