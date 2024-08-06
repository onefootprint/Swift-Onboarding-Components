import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoEmail24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m4.485 18.125.34-.668-.34.668Zm-.388-.388-.668.34.668-.34Zm15.806 0-.668-.34.668.34Zm-.388.388.34.669-.34-.669Zm.388-11.862-.668.34.668-.34Zm-.388-.388.34-.669-.34.669Zm-15.418.388-.668-.34.668.34Zm.388-.388-.34-.669.34.669Zm8.078 6.553.475.58-.475-.58Zm-1.126 0-.475.58.475-.58ZM19.25 7.2v9.6h1.5V7.2h-1.5Zm-.672 10.272H5.422v1.5h13.156v-1.5ZM4.75 16.8V7.2h-1.5v9.6h1.5Zm.672-10.272h13.156v-1.5H5.422v1.5Zm0 10.944c-.261 0-.412 0-.523-.01-.101-.008-.101-.02-.073-.005l-.681 1.337c.218.11.438.148.632.164.186.015.409.014.645.014v-1.5ZM3.25 16.8c0 .236 0 .459.015.645.015.195.052.414.164.632l1.336-.68c.015.028.003.028-.005-.074a7.356 7.356 0 0 1-.01-.523h-1.5Zm1.576.657a.139.139 0 0 1-.06-.06l-1.337.68c.157.309.407.56.716.717l.68-1.337ZM19.25 16.8c0 .261 0 .412-.01.523-.008.102-.02.102-.005.073l1.336.681a1.66 1.66 0 0 0 .164-.632c.016-.186.015-.409.015-.645h-1.5Zm-.672 2.172c.236 0 .459 0 .645-.014a1.66 1.66 0 0 0 .632-.164l-.68-1.337c.027-.014.027-.003-.075.006-.11.009-.26.01-.522.01v1.5Zm.657-1.576a.14.14 0 0 1-.06.061l.68 1.337a1.64 1.64 0 0 0 .716-.717l-1.336-.68ZM20.75 7.2c0-.237 0-.46-.015-.645a1.66 1.66 0 0 0-.164-.632l-1.336.68c-.014-.028-.003-.028.005.074.01.11.01.262.01.523h1.5Zm-2.172-.672c.261 0 .412 0 .523.01.101.008.101.02.073.005l.681-1.337a1.66 1.66 0 0 0-.632-.164c-.186-.015-.409-.014-.645-.014v1.5Zm1.993-.605a1.64 1.64 0 0 0-.716-.717l-.68 1.337a.14.14 0 0 1 .06.06l1.336-.68ZM4.75 7.2c0-.261 0-.412.01-.523.008-.102.02-.102.005-.073L3.43 5.923a1.66 1.66 0 0 0-.164.632c-.016.186-.015.408-.015.645h1.5Zm.672-2.172c-.236 0-.459 0-.645.014a1.66 1.66 0 0 0-.632.164l.68 1.337c-.027.014-.027.003.074-.006.111-.009.262-.01.523-.01v-1.5Zm-.657 1.576a.139.139 0 0 1 .06-.061l-.68-1.337c-.309.158-.56.408-.716.717l1.336.68Zm14.76-.841-7.437 6.085.95 1.16 7.437-6.084-.95-1.161Zm-7.613 6.085L4.475 5.763l-.95 1.16 7.437 6.086.95-1.161Zm.176 0a.14.14 0 0 1-.176 0l-.95 1.16a1.639 1.639 0 0 0 2.076 0l-.95-1.16Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoEmail24;
