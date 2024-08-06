import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSearchSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="m17 17-2.469-2.469m1.219-3.156a4.375 4.375 0 1 1-8.75 0 4.375 4.375 0 0 1 8.75 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
};
export default IcoSearchSmall24;
