import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoChartUp16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.953 2.45a.162.162 0 0 0-.161.162v10.772c0 .09.072.162.161.162h.431c.09 0 .162-.072.162-.162V2.612a.162.162 0 0 0-.162-.162h-.43Zm-1.561.162c0-.863.699-1.562 1.561-1.562h.431c.863 0 1.562.7 1.562 1.562v10.772c0 .863-.7 1.562-1.562 1.562h-.43c-.863 0-1.562-.699-1.562-1.562V2.612Zm-5.73-.162L1.255 6.857a.7.7 0 0 0 .99.99L6.652 3.44v1.326a.7.7 0 1 0 1.4 0V1.75a.7.7 0 0 0-.7-.7H4.335a.7.7 0 1 0 0 1.4h1.327Zm-3.05 8.618a.162.162 0 0 0-.162.162v2.154c0 .09.072.162.162.162h.43c.09 0 .163-.072.163-.162V11.23a.162.162 0 0 0-.162-.162h-.431Zm-1.562.162c0-.863.7-1.562 1.562-1.562h.43c.863 0 1.563.7 1.563 1.562v2.154c0 .863-.7 1.562-1.562 1.562h-.431c-.863 0-1.562-.699-1.562-1.562V11.23Zm6.57-2.586c0-.089.073-.161.163-.161h.43c.09 0 .162.072.162.161v4.74c0 .09-.072.162-.162.162h-.43a.162.162 0 0 1-.162-.162v-4.74Zm.163-1.561c-.863 0-1.562.699-1.562 1.561v4.74c0 .863.699 1.562 1.562 1.562h.43c.863 0 1.562-.699 1.562-1.562v-4.74c0-.862-.699-1.561-1.562-1.561h-.43Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChartUp16;
