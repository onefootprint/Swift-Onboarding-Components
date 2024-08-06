import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFaceid24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.875 5.125H5.958a.833.833 0 0 0-.833.833v2.917m0 6.25v2.917c0 .46.373.833.833.833h2.917m6.25-13.75h2.917c.46 0 .833.373.833.833v2.917m0 6.25v2.917c0 .46-.373.833-.833.833h-2.917m-2.917-9.583v1.875c0 .85-.636 1.55-1.458 1.653M8.458 9.292v1.25m7.084-1.25v1.25M9.5 15.082c.735.425 1.59.668 2.5.668.91 0 1.765-.243 2.5-.669"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoFaceid24;
