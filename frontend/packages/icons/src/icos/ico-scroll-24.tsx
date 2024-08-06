import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoScroll24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M12.833 4.5H7a.833.833 0 0 0-.833.833v13.334c0 .46.373.833.833.833h1.25m4.583-15 5 5m-5-5v4.167c0 .46.373.833.833.833h4.167m0 0v9.167c0 .46-.373.833-.833.833h-1.25M12 13.667v5m0 0 2.083-2.084M12 18.667l-2.083-2.084"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoScroll24;
