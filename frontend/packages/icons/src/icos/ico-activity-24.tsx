import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoActivity24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.667 11.933h2.722a.833.833 0 0 0 .795-.582L9.3 4.646a.208.208 0 0 1 .397 0l4.603 14.575a.208.208 0 0 0 .397 0l2.118-6.706a.833.833 0 0 1 .795-.582h2.722"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoActivity24;
