import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../src/types';

const IcoLeaf40 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m32.32 7.67 1.247.086a1.25 1.25 0 0 0-1.472-1.316l.225 1.23ZM10.457 30.497l.04.032c2.498 2.023 5.876 3.04 9.498 3.04 3.213 0 5.643-1.884 7.425-4.374 1.775-2.48 3.031-5.72 3.924-8.858.897-3.155 1.452-6.297 1.782-8.641a71.507 71.507 0 0 0 .418-3.645l.017-.216.004-.057.001-.015v-.006L32.32 7.67l-.226-1.23h-.001l-.004.002-.015.002-.057.011-.214.041c-.186.037-.457.09-.8.163-.686.144-1.663.36-2.835.65-2.34.578-5.47 1.452-8.613 2.633-3.127 1.176-6.339 2.682-8.791 4.551-2.427 1.85-4.344 4.24-4.344 7.202 0 2.765.832 5.123 2.271 6.99-.413.546-.77 1.04-1.067 1.46a41.767 41.767 0 0 0-.996 1.484l-.015.023-.004.006v.002l-.001.001.996.617-.997-.616a1.25 1.25 0 0 0 2.126 1.316l.002-.004.01-.016a15.09 15.09 0 0 1 .221-.343 48.176 48.176 0 0 1 1.49-2.118Zm1.545-1.966.067.055c1.963 1.589 4.748 2.484 7.926 2.484 2.099 0 3.866-1.197 5.392-3.33 1.531-2.14 2.692-5.062 3.552-8.087.856-3.008 1.39-6.028 1.711-8.306.115-.813.202-1.53.266-2.112-.59.13-1.319.296-2.148.501-2.282.564-5.313 1.411-8.333 2.546-3.035 1.141-5.986 2.546-8.156 4.2-2.195 1.672-3.359 3.415-3.359 5.213 0 1.958.508 3.612 1.392 4.96l.068-.082c2.323-2.755 5.633-6.085 9.455-8.108a1.25 1.25 0 1 1 1.17 2.21c-3.403 1.801-6.468 4.846-8.714 7.51l-.289.346Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoLeaf40;
