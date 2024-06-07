import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const ThemedLogoFpLarge = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={229}
      height={48}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)" fill={theme.color[color]}>
        <path d="M55.275 9.54h17.89v4.37h-12.94l-.002 8.678H72.11v4.372l-11.887-.002v12.58l-4.95-.002M92.492 28.739c0-4.157-2.58-7.071-6.345-7.071-3.807 0-6.345 2.914-6.345 7.07 0 4.157 2.538 7.071 6.345 7.071 3.765.002 6.345-2.914 6.345-7.07Zm-17.342 0c0-6.471 4.568-11.143 10.997-11.143 6.387.001 10.998 4.672 10.998 11.143 0 6.47-4.61 11.14-10.998 11.14-6.43 0-10.998-4.67-10.997-11.14ZM116.991 28.74c0-4.158-2.58-7.071-6.345-7.071-3.807 0-6.345 2.913-6.345 7.07 0 4.156 2.538 7.072 6.345 7.072 3.765 0 6.345-2.914 6.345-7.071Zm-17.342 0c0-6.472 4.568-11.143 10.997-11.143 6.387 0 10.997 4.672 10.997 11.143 0 6.47-4.61 11.141-10.997 11.141-6.43 0-10.999-4.672-10.997-11.141ZM157.912 28.741c0-4.285-2.454-7.07-6.176-7.07-3.722-.002-6.176 2.785-6.176 7.069 0 4.243 2.454 7.072 6.176 7.072s6.176-2.83 6.176-7.071Zm-16.668-10.8h4.612v2.743c1.185-1.757 3.68-3.085 6.641-3.085 6.303 0 10.026 4.628 10.026 11.142-.003 6.513-3.893 11.141-10.28 11.141-2.581 0-5.076-1.115-6.387-2.829v10.285h-4.612M183.038 17.942h4.611l-.003 21.598h-4.608V17.942Zm-.679-6.6c0-1.713 1.269-3.042 2.962-3.042 1.734 0 3.048 1.329 3.048 3.043 0 1.671-1.314 2.999-3.048 2.999-1.693 0-2.962-1.328-2.962-3ZM193.195 17.942h4.611v3.6c1.436-2.313 3.89-3.942 7.021-3.942 4.525 0 7.698 3.042 7.698 7.713v14.228h-4.611l.002-13.155c0-2.702-1.65-4.587-4.357-4.587-3.597 0-5.753 3.085-5.753 8.27l-.002 9.472h-4.609M179.531 17.89c-.612-.193-1.406-.29-2.105-.29-2.579-.002-5.37 1.885-6.513 4.456v-4.114h-4.611V39.54h4.611v-8.056c0-6.685 2.75-9.514 5.88-9.514.968 0 1.977.17 2.738.51M136.773 35.176c-.803.385-1.895.55-2.699.55-1.733 0-2.918-1.116-2.918-3.258V21.926h5.602v-3.985l-5.602-.001v-6.427h-4.609v6.427h-3.724v3.985l3.724.002v10.798c0 4.928 3.002 7.156 7.02 7.156 1.072 0 2.26-.183 3.206-.464M228.867 35.179c-.804.385-1.898.549-2.702.549-1.734 0-2.919-1.115-2.919-3.258l.003-10.541h5.599v-3.986h-5.599v-6.428h-4.611v6.427h-3.723v3.986h3.723v10.8c0 4.928 3.002 7.155 7.02 7.155 1.072 0 2.26-.183 3.209-.464M23.69 30h7.897v-7.078A7.776 7.776 0 0 1 27.639 24c-4.362 0-7.897-3.581-7.897-8 0-4.418 3.535-8 7.897-8 1.44 0 2.785.397 3.948 1.079V0H0v48h13.82v-8c0-5.523 4.419-10 9.87-10Z" />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h229v48H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default ThemedLogoFpLarge;
