import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeft16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.893 4.798c-.086.05-.58.526-1.404 1.353C6.013 7.633 6.067 7.564 6.067 8c0 .436-.054.367 1.422 1.848.699.7 1.317 1.306 1.374 1.345.121.084.378.113.538.06a.733.733 0 0 0 .363-.333.718.718 0 0 0 .008-.488c-.028-.067-.408-.466-1.206-1.265L7.4 8l1.166-1.167c.798-.799 1.178-1.198 1.206-1.265a.706.706 0 0 0-.009-.488.624.624 0 0 0-.87-.282"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeft16;
