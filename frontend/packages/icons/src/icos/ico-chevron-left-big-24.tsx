import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeftBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M14.178 4.662c-.067.033-1.563 1.504-3.324 3.269C7.198 11.596 7.46 11.281 7.46 12c0 .719-.265.401 3.415 4.09 2.357 2.362 3.26 3.242 3.359 3.275.466.153.952-.139.996-.599.039-.406.176-.251-3.204-3.636L8.901 12l3.125-3.13c2.536-2.54 3.135-3.159 3.174-3.285.159-.501-.186-.986-.699-.984a.889.889 0 0 0-.323.061"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeftBig24;
