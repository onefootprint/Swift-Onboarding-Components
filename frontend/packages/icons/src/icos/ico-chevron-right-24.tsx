import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronRight24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.851 7.305c-.384.19-.545.59-.39.966.043.102.623.711 1.85 1.939L13.099 12l-1.805 1.81c-1.939 1.945-1.925 1.927-1.884 2.295a.745.745 0 0 0 1.001.6c.136-.051.554-.449 2.055-1.955 1.037-1.039 1.917-1.953 1.956-2.03a1.608 1.608 0 0 0 0-1.44c-.107-.211-3.766-3.872-3.962-3.964a.74.74 0 0 0-.609-.011"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronRight24;
