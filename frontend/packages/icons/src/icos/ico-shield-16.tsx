import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoShield16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
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
        d="M8.286 1.111a.7.7 0 0 0-.572 0L1.48 3.906a.7.7 0 0 0-.412.592l.698.047a78.356 78.356 0 0 0-.698-.046v.003l-.001.007-.002.025a12.138 12.138 0 0 0-.014.415c-.004.278-.002.672.023 1.143.048.94.188 2.206.557 3.483.368 1.273.977 2.606 1.998 3.626 1.039 1.04 2.467 1.717 4.371 1.717 1.904 0 3.332-.678 4.371-1.717 1.02-1.02 1.63-2.353 1.998-3.626.37-1.277.509-2.544.557-3.483a17.084 17.084 0 0 0 .013-1.469l-.005-.09V4.51l-.001-.007v-.003l-.7.046.7-.047a.7.7 0 0 0-.413-.592L8.286 1.11ZM2.472 6.02a15.73 15.73 0 0 1-.02-1.016L8 2.517l5.549 2.487c.003.25 0 .6-.02 1.016-.046.874-.175 2.026-.505 3.167-.33 1.145-.85 2.231-1.643 3.024-.775.775-1.846 1.307-3.381 1.307-1.535 0-2.606-.532-3.381-1.307-.793-.793-1.312-1.879-1.643-3.024-.33-1.14-.459-2.293-.504-3.167Zm8.03.44a.7.7 0 1 0-1.135-.82L7.101 8.777l-.498-.597a.7.7 0 0 0-1.075.896l1.074 1.29a.7.7 0 0 0 1.106-.039l2.794-3.869Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoShield16;
