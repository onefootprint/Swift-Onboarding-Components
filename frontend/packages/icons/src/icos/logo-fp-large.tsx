import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const LogoFpLarge = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={229}
      height={48}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M55.275 5.72h17.89v4.371h-12.94l-.002 8.677H72.11v4.372l-11.887-.001v12.579l-4.95-.002M92.492 24.919c0-4.157-2.58-7.07-6.345-7.07-3.807 0-6.345 2.913-6.345 7.07s2.538 7.07 6.345 7.07c3.765.002 6.345-2.913 6.345-7.07Zm-17.342 0c0-6.47 4.568-11.142 10.997-11.142 6.387 0 10.998 4.671 10.998 11.142 0 6.47-4.611 11.141-10.998 11.141-6.43 0-10.998-4.67-10.997-11.141ZM116.991 24.92c0-4.158-2.58-7.07-6.345-7.07-3.807 0-6.345 2.912-6.345 7.07 0 4.156 2.538 7.071 6.345 7.071 3.765 0 6.345-2.914 6.345-7.07Zm-17.342 0c0-6.472 4.568-11.142 10.997-11.142 6.387 0 10.997 4.671 10.997 11.142 0 6.47-4.61 11.141-10.997 11.141-6.43 0-10.999-4.671-10.997-11.14ZM157.912 24.921c0-4.285-2.454-7.07-6.176-7.07-3.722-.002-6.176 2.785-6.176 7.07 0 4.242 2.454 7.071 6.176 7.071s6.176-2.829 6.176-7.07Zm-16.668-10.8h4.612v2.743c1.185-1.756 3.68-3.085 6.641-3.085 6.303 0 10.026 4.628 10.026 11.142-.003 6.514-3.893 11.142-10.28 11.142-2.581 0-5.076-1.116-6.387-2.83V43.52h-4.612M183.038 14.123h4.611l-.003 21.597h-4.608V14.123Zm-.678-6.6c0-1.714 1.268-3.043 2.961-3.043 1.734 0 3.048 1.33 3.048 3.043 0 1.672-1.314 3-3.048 3-1.693 0-2.961-1.328-2.961-3ZM193.195 14.123h4.611v3.6c1.436-2.314 3.89-3.943 7.021-3.943 4.525 0 7.698 3.043 7.698 7.713v14.228h-4.611l.002-13.155c0-2.701-1.65-4.587-4.357-4.587-3.597 0-5.753 3.086-5.753 8.271l-.002 9.471h-4.609M179.531 14.07c-.612-.193-1.406-.29-2.105-.29-2.579-.001-5.37 1.885-6.513 4.457v-4.114l-4.611-.002V35.72h4.611v-8.056c0-6.684 2.75-9.513 5.88-9.513.968 0 1.977.17 2.738.51M136.773 31.357c-.803.385-1.895.549-2.699.549-1.733 0-2.918-1.115-2.918-3.258V18.107h5.602V14.12h-5.602V7.692h-4.609v6.427h-3.724v3.986h3.724v10.8c0 4.928 3.002 7.155 7.02 7.155 1.072 0 2.26-.183 3.206-.464M228.867 31.359c-.804.385-1.898.55-2.702.55-1.734 0-2.919-1.116-2.919-3.258l.003-10.542h5.599v-3.985l-5.599-.001V7.696h-4.611v6.427h-3.723v3.985l3.723.001v10.799c0 4.928 3.002 7.156 7.02 7.156 1.072 0 2.26-.183 3.209-.464M23.69 30h7.897v-7.078A7.776 7.776 0 0 1 27.639 24c-4.362 0-7.897-3.581-7.897-8 0-4.418 3.535-8 7.897-8 1.44 0 2.785.397 3.948 1.079V0H0v48h13.82v-8c0-5.523 4.419-10 9.87-10Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default LogoFpLarge;
