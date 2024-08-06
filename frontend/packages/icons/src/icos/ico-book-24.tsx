import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.5 4.917H6.583a.833.833 0 0 0-.833.833v12.5c0 .46.373.833.833.833H9.5m0-14.166h7.917c.46 0 .833.373.833.833v12.5c0 .46-.373.833-.833.833H9.5m0-14.166v14.166m3.333-10.416h2.084M12.833 12h2.084"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoBook24;
