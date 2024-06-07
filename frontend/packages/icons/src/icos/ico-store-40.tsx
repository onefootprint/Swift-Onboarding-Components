import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoStore40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
        d="M6.1 7.968a5.335 5.335 0 0 1 4.857-3.128H29.03a5.335 5.335 0 0 1 4.857 3.128l1.002 2.204c.458.316.758.843.758 1.441 0 .64-.081 1.296-.25 1.934v16.285a5.335 5.335 0 0 1-5.335 5.335h-4.856c-.263.158-.57.248-.899.248h-8.63c-.328 0-.635-.09-.897-.248H9.925a5.335 5.335 0 0 1-5.335-5.335V13.551a7.587 7.587 0 0 1-.251-1.938c0-.598.3-1.127.759-1.442L6.1 7.968Zm19.957 24.2v-5.215c0-3.084-2.5-5.585-5.585-5.585h-.959a5.585 5.585 0 0 0-5.585 5.585v5.214H9.926a2.335 2.335 0 0 1-2.335-2.335V17.485c.808.428 1.753.672 2.814.672 2.02 0 3.684-.863 4.828-2.139 1.2 1.284 2.94 2.14 5.014 2.14 1.96 0 3.546-.774 4.636-2 1.139 1.198 2.753 2 4.699 2 1.061 0 2.006-.246 2.815-.673v12.347a2.335 2.335 0 0 1-2.335 2.335h-4.005Zm6.1-20.756a1.775 1.775 0 0 0-.01.201c0 .864-.265 1.658-.697 2.2-.396.495-.977.845-1.868.845-1.756 0-2.99-1.443-3.043-2.943l.001-.102a1.75 1.75 0 0 0-1.726-1.75h-.026a1.75 1.75 0 0 0-1.75 1.86c-.022.8-.288 1.538-.723 2.055-.422.502-1.066.88-2.068.88-2.03 0-3.297-1.596-3.297-3.045a1.75 1.75 0 0 0-3.501 0c0 1.536-1.249 3.045-3.044 3.045-.892 0-1.473-.35-1.869-.846-.431-.54-.696-1.335-.696-2.199 0-.067-.004-.133-.011-.199L8.83 9.21a2.335 2.335 0 0 1 2.126-1.369H29.03c.916 0 1.747.535 2.126 1.369l1.002 2.203Zm-14.73 15.541c0-1.151.934-2.085 2.086-2.085h.959c1.152 0 2.085.934 2.085 2.085v4.962h-5.13v-4.962Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoStore40;
