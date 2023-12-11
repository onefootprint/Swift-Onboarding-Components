import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoLeaf24 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="m19.25 4.75.748.052a.75.75 0 0 0-.883-.79l.135.738ZM6.392 18.199a.86.86 0 0 0 .011.009C7.877 19.4 9.867 20 12 20c1.897 0 3.33-1.113 4.38-2.58 1.045-1.46 1.785-3.369 2.31-5.215.528-1.857.855-3.705 1.049-5.085a42.045 42.045 0 0 0 .256-2.272l.002-.033.001-.01v-.002l-.748-.053a101.24 101.24 0 0 0-.135-.738h-.003l-.01.003-.033.006a20.29 20.29 0 0 0-.596.12 49.42 49.42 0 0 0-1.668.382c-1.377.34-3.22.855-5.069 1.55-1.84.692-3.73 1.578-5.175 2.679C5.132 9.84 4.001 11.25 4.001 13c0 1.626.487 3.013 1.331 4.113a30.23 30.23 0 0 0-1.06 1.495l-.117.18-.03.048-.009.013-.002.004-.001.002.637.395-.638-.395a.75.75 0 0 0 1.276.79v-.002l.007-.01.025-.04.105-.161a28.119 28.119 0 0 1 .867-1.233Zm.927-1.18.028.023C8.499 17.974 10.133 18.5 12 18.5c1.228 0 2.264-.7 3.16-1.952.9-1.257 1.581-2.974 2.087-4.753.503-1.768.818-3.545 1.006-4.884.067-.469.117-.883.154-1.222-.343.076-.764.172-1.243.29-1.342.332-3.124.83-4.9 1.498-1.785.67-3.519 1.497-4.794 2.468C6.18 10.928 5.5 11.95 5.5 13c0 1.141.294 2.106.806 2.893l.027-.033c1.367-1.621 3.316-3.581 5.566-4.773a.75.75 0 1 1 .702 1.326c-2 1.058-3.8 2.848-5.121 4.414l-.16.192Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLeaf24;
