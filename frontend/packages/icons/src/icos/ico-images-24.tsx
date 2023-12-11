import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoImages24 = ({
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
        d="M19.333 6v-.667a2.005 2.005 0 0 0-2-2H4a2.006 2.006 0 0 0-2 2V16a2.006 2.006 0 0 0 2 2h.667M7.25 6.667h12.834c1.058 0 1.916.858 1.916 1.916V18.75a1.916 1.916 0 0 1-1.916 1.917H7.25a1.916 1.916 0 0 1-1.917-1.917V8.583c0-1.058.858-1.916 1.917-1.916Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M15.062 17.373a.75.75 0 0 0 1.056-1.065l-1.056 1.065Zm-3.104-4.132.528-.533-.528.533Zm-1.757-.05-.496-.563.496.563Zm-5.364 3.732a.75.75 0 1 0 .993 1.124l-.993-1.124Zm7.02 3.212a.75.75 0 1 0 1.056 1.064l-1.057-1.065Zm5.469-4.374-.527-.534-.002.002.529.532Zm1.727-.078.478-.578h-.001l-.477.578Zm2.469 3.016a.75.75 0 0 0 .956-1.156l-.956 1.156Zm-4.118-8.214a.528.528 0 0 1-.532.523v1.5c1.117 0 2.032-.9 2.032-2.023h-1.5Zm-.532.523a.528.528 0 0 1-.532-.523h-1.5c0 1.122.915 2.023 2.032 2.023v-1.5Zm-.532-.523c0-.284.233-.523.532-.523v-1.5c-1.117 0-2.032.9-2.032 2.023h1.5Zm.532-.523c.299 0 .532.24.532.523h1.5a2.028 2.028 0 0 0-2.032-2.023v1.5Zm-.754 6.346-3.632-3.6-1.056 1.066 3.632 3.6 1.056-1.066Zm-3.632-3.6a2.039 2.039 0 0 0-1.375-.588l-.043 1.5c.136.003.266.059.363.154l1.055-1.067Zm-1.375-.588a2.038 2.038 0 0 0-1.406.508l.992 1.125a.54.54 0 0 1 .371-.134l.043-1.5Zm-1.406.508-4.868 4.295.993 1.124 4.867-4.294-.992-1.125Zm3.208 8.571 4.941-4.905-1.057-1.065-4.94 4.905 1.056 1.065Zm4.94-4.904a.541.541 0 0 1 .355-.155l-.067-1.499a2.042 2.042 0 0 0-1.342.586l1.053 1.068Zm.355-.155a.542.542 0 0 1 .369.123l.953-1.159a2.041 2.041 0 0 0-1.39-.463l.068 1.499Zm.367.121 2.947 2.438.956-1.156-2.947-2.438-.956 1.156Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoImages24;
