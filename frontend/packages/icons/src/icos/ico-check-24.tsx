import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheck24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M16.975 7.123a.94.94 0 0 0-.286.187c-.089.082-1.615 1.815-3.391 3.85a1088.226 1088.226 0 0 1-3.323 3.799l-.095.099-1.31-1.305c-.721-.717-1.373-1.336-1.449-1.374-.174-.088-.503-.091-.667-.006a.781.781 0 0 0-.396.813c.028.192.047.213 1.715 1.888 1.728 1.736 1.854 1.844 2.147 1.844.344 0 .248.102 4.183-4.394 2.044-2.336 3.748-4.313 3.786-4.395.264-.569-.296-1.185-.914-1.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheck24;
