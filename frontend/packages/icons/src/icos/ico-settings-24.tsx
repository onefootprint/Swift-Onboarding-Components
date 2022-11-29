import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoSettings24 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.876 4.05c-.87 0-1.608.643-1.727 1.505l-.087.628c-.011.082-.084.204-.26.274a5.93 5.93 0 0 0-.19.08c-.175.076-.313.042-.379-.008L8.928 6.3a1.744 1.744 0 0 0-2.28.162l-.186.186a1.744 1.744 0 0 0-.162 2.28l.23.305c.049.066.083.204.007.378a5.907 5.907 0 0 0-.08.19c-.07.177-.192.25-.274.261l-.628.087a1.744 1.744 0 0 0-1.505 1.727v.255c0 .871.643 1.609 1.505 1.728l.628.086c.082.011.204.085.274.261.025.064.052.127.08.19.076.174.042.312-.008.378l-.229.306a1.744 1.744 0 0 0 .162 2.279l.186.186a1.744 1.744 0 0 0 2.28.162l.305-.229c.066-.05.204-.083.378-.007l.19.08c.177.07.25.192.261.273l.087.628a1.744 1.744 0 0 0 1.727 1.505h.255c.871 0 1.609-.642 1.728-1.505l.086-.628c.011-.082.085-.204.261-.274.064-.025.127-.052.19-.08.174-.075.312-.041.378.008l.306.23c.694.52 1.665.45 2.279-.163l.186-.186a1.744 1.744 0 0 0 .162-2.28l-.229-.305c-.05-.066-.083-.204-.007-.378l.08-.19c.07-.176.192-.25.273-.26l.628-.087a1.744 1.744 0 0 0 1.505-1.728v-.255c0-.87-.642-1.608-1.505-1.727l-.628-.087c-.082-.011-.204-.084-.274-.26a5.968 5.968 0 0 0-.08-.19c-.075-.175-.041-.313.008-.379l.23-.305a1.744 1.744 0 0 0-.163-2.28l-.186-.186a1.744 1.744 0 0 0-2.28-.162l-.305.23c-.066.049-.204.083-.378.006a6.072 6.072 0 0 0-.19-.079c-.176-.07-.25-.192-.26-.274l-.087-.628A1.744 1.744 0 0 0 12.13 4.05h-.255Zm-.241 1.71c.016-.12.12-.21.241-.21h.255c.122 0 .225.09.242.21l.086.628c.1.72.618 1.235 1.193 1.463.048.019.095.039.142.06.567.248 1.3.254 1.88-.182l.306-.229a.244.244 0 0 1 .318.023l.187.186a.244.244 0 0 1 .022.319l-.229.305c-.436.581-.43 1.313-.181 1.88l.06.142c.228.575.743 1.094 1.462 1.193l.628.087c.12.016.21.12.21.241v.255c0 .122-.09.225-.21.242l-.628.086c-.719.1-1.234.618-1.463 1.193a4.436 4.436 0 0 1-.06.142c-.248.567-.254 1.3.182 1.88l.23.306a.244.244 0 0 1-.023.318l-.187.187a.244.244 0 0 1-.318.022l-.306-.229c-.58-.436-1.313-.43-1.88-.181l-.142.06c-.575.228-1.094.743-1.193 1.462l-.086.628a.243.243 0 0 1-.242.21h-.255a.243.243 0 0 1-.241-.21l-.087-.628c-.1-.719-.618-1.234-1.193-1.463a4.337 4.337 0 0 1-.142-.06c-.567-.248-1.299-.254-1.88.182l-.305.23a.244.244 0 0 1-.319-.023l-.186-.187a.244.244 0 0 1-.023-.318l-.43-.322.43.322.23-.306c.435-.58.429-1.313.18-1.88a4.358 4.358 0 0 1-.059-.142c-.228-.575-.744-1.094-1.463-1.193l-.628-.086a.244.244 0 0 1-.21-.242v-.255c0-.122.09-.225.21-.241l.628-.087c.72-.1 1.235-.618 1.463-1.193.019-.048.039-.095.06-.142.248-.567.254-1.299-.182-1.88L7.5 8.028a.244.244 0 0 1 .023-.319l.186-.186a.244.244 0 0 1 .319-.023l.305.23c.581.435 1.313.429 1.88.18l.142-.059c.575-.228 1.094-.744 1.193-1.463l.087-.628Zm.369 8.986a2.742 2.742 0 1 0 0-5.484 2.742 2.742 0 0 0 0 5.484Zm1.242-2.742a1.242 1.242 0 1 1-2.484 0 1.242 1.242 0 0 1 2.484 0Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSettings24;
