import React from 'react';
import { useTheme } from 'styled';

import type { IconProps } from '../src/types';

const IcoUser16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.678 4.278a2.328 2.328 0 1 1 4.656 0 2.328 2.328 0 0 1-4.656 0ZM8.006.55a3.728 3.728 0 1 0 0 7.456 3.728 3.728 0 0 0 0-7.456ZM2.438 13.23a4.455 4.455 0 0 1 1.686-1.762c.855-.51 2.09-.9 3.882-.9 1.791 0 3.027.39 3.882.9a4.456 4.456 0 0 1 1.686 1.763c.111.21.076.376-.037.517-.13.165-.392.311-.73.311H3.205c-.339 0-.6-.146-.731-.31-.113-.142-.148-.308-.037-.518Zm5.568-4.062c-1.999 0-3.492.437-4.6 1.098a5.854 5.854 0 0 0-2.206 2.31 1.83 1.83 0 0 0 .18 2.044c.42.528 1.1.84 1.826.84h9.6c.726 0 1.406-.312 1.827-.84a1.83 1.83 0 0 0 .179-2.043 5.853 5.853 0 0 0-2.207-2.311c-1.107-.661-2.6-1.098-4.599-1.098Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoUser16;
