import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoLockOpen16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.27 3.1c.393-.54 1.155-1.15 2.74-1.15.744 0 1.36.28 1.806.577a3.854 3.854 0 0 1 .632.528l.026.03.003.003a.75.75 0 0 0 1.151-.962l-.576.48.576-.48-.002-.002-.002-.002-.005-.007-.017-.02a4.328 4.328 0 0 0-.246-.254 5.347 5.347 0 0 0-.707-.562C10.042.874 9.14.45 8.01.45c-2.052 0-3.27.829-3.953 1.767-.438.603-.624 1.28-.706 1.92-.071.554-.07 1.13-.068 1.635V6.074h-.186c-.932 0-1.686.756-1.686 1.687v5.155a2.623 2.623 0 0 0 2.622 2.625h7.955a2.623 2.623 0 0 0 2.621-2.625V7.761c0-.93-.754-1.687-1.686-1.687h-8.14v-.31c-.001-.516-.002-.986.055-1.435.064-.497.194-.902.432-1.23ZM2.911 7.76c0-.104.085-.187.186-.187h9.826c.102 0 .186.083.186.187v5.155c0 .623-.503 1.125-1.121 1.125H4.033a1.123 1.123 0 0 1-1.122-1.125V7.761Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLockOpen16;
