import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdCard40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.557 11.42c0-.235.196-.447.465-.447h24.946c.27 0 .465.212.465.447v16.82a.456.456 0 0 1-.465.448H21.781c-.47-1.446-1.157-2.958-2.019-4.188a8.515 8.515 0 0 0-1.383-1.562 4.975 4.975 0 0 0 2.15-4.097c0-2.77-2.261-4.994-5.023-4.994-2.762 0-5.024 2.223-5.024 4.994 0 1.701.853 3.196 2.15 4.097A8.511 8.511 0 0 0 11.25 24.5c-.862 1.23-1.549 2.742-2.02 4.188H8.022a.456.456 0 0 1-.465-.448V11.42Zm9.697 14.838c.482.687.917 1.537 1.273 2.43h-6.042c.355-.893.79-1.743 1.273-2.43.802-1.145 1.434-1.434 1.748-1.434.314 0 .946.289 1.748 1.434ZM8.022 7.91c-1.936 0-3.527 1.56-3.527 3.51v16.82c0 1.95 1.591 3.51 3.527 3.51h24.946c1.936 0 3.527-1.56 3.527-3.51V11.42c0-1.95-1.591-3.51-3.527-3.51H8.022Zm5.523 10.93c0-1.054.865-1.93 1.96-1.93 1.096 0 1.962.876 1.962 1.93 0 1.055-.866 1.933-1.961 1.933-1.096 0-1.961-.878-1.961-1.932Zm12.438-3.014a1.531 1.531 0 1 0 0 3.062h2.994a1.531 1.531 0 1 0 0-3.062h-2.994Zm0 5.936a1.531 1.531 0 1 0 0 3.062h2.994a1.531 1.531 0 1 0 0-3.062h-2.994Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdCard40;
