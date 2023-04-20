import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

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
        d="m33.251 6.75 1.746.12a1.75 1.75 0 0 0-2.06-1.841l.314 1.721ZM9.626 31.716c2.764 2.196 6.453 3.285 10.375 3.285 3.635 0 6.355-2.137 8.312-4.872 1.948-2.723 3.315-6.258 4.28-9.65.971-3.415 1.57-6.813 1.927-9.344a77.006 77.006 0 0 0 .452-3.942l.018-.234.005-.063.001-.018v-.007l-1.745-.121-.315-1.721h-.007l-.017.004-.062.012-.233.044a90.691 90.691 0 0 0-3.927.878c-2.524.625-5.907 1.569-9.305 2.846-3.378 1.27-6.873 2.906-9.555 4.95C7.184 15.778 5 18.453 5 21.828c0 3.044.913 5.652 2.496 7.725-.35.468-.66.896-.923 1.271a45.145 45.145 0 0 0-1.076 1.602l-.016.025-.004.007-.002.002v.001l1.201.745-1.201-.744a1.5 1.5 0 0 0 2.55 1.58v-.001l.002-.003.01-.017a15.373 15.373 0 0 1 .237-.367 50.914 50.914 0 0 1 1.352-1.938Zm2.163-2.752c2.02 1.612 4.896 2.537 8.212 2.537 2.075 0 3.867-1.175 5.466-3.409 1.607-2.246 2.84-5.336 3.76-8.57.912-3.21 1.484-6.438 1.827-8.875.088-.623.16-1.192.22-1.694-.515.116-1.1.254-1.744.413-2.444.604-5.686 1.51-8.914 2.723-3.248 1.22-6.378 2.715-8.665 4.457-2.322 1.77-3.451 3.54-3.451 5.282 0 1.91.465 3.531 1.278 4.87 2.489-2.913 5.97-6.358 9.978-8.48a1.5 1.5 0 1 1 1.403 2.651c-3.632 1.924-6.912 5.18-9.321 8.037-.017.02-.033.04-.05.058Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLeaf40;
