import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinusXSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M4.747 7.429A.671.671 0 0 0 4.374 8c0 .242.189.51.417.591.152.053 6.266.053 6.418 0A.677.677 0 0 0 11.626 8a.668.668 0 0 0-.392-.577c-.07-.03-.652-.036-3.24-.035-2.758.001-3.166.006-3.247.041"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinusXSmall16;
