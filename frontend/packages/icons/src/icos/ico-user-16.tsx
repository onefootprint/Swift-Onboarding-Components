import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUser16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.76 4.454a2.234 2.234 0 1 1 4.469 0 2.234 2.234 0 0 1-4.468 0ZM7.996.92a3.534 3.534 0 1 0 0 7.068 3.534 3.534 0 0 0 0-7.068ZM2.677 12.973a4.26 4.26 0 0 1 1.612-1.686c.817-.488 1.997-.859 3.706-.859 1.708 0 2.888.371 3.705.86a4.26 4.26 0 0 1 1.613 1.685c.109.207.074.371-.037.511-.128.161-.383.303-.71.303H3.424c-.327 0-.581-.142-.71-.303-.11-.14-.145-.304-.036-.511Zm5.318-3.845c-1.902 0-3.32.415-4.373 1.043a5.56 5.56 0 0 0-2.095 2.195 1.727 1.727 0 0 0 .17 1.928c.396.498 1.039.793 1.726.793h9.144c.686 0 1.329-.295 1.726-.793.414-.52.533-1.239.17-1.928a5.56 5.56 0 0 0-2.096-2.195c-1.053-.628-2.471-1.043-4.372-1.043Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoUser16;
