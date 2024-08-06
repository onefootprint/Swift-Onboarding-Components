import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCode224 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m10.125 18.875 3.75-13.75m3.334 3.333 2.795 2.97a.833.833 0 0 1 0 1.143l-2.796 2.97m-10.416 0-2.796-2.97a.833.833 0 0 1 0-1.142l2.796-2.97"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoCode224;
