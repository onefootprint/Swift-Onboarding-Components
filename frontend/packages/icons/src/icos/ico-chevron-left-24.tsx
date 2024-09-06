import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeft24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.54 7.314c-.197.095-3.857 3.759-3.962 3.966a1.59 1.59 0 0 0 .003 1.446c.038.074.916.985 1.953 2.024 1.501 1.506 1.919 1.904 2.055 1.955a.745.745 0 0 0 1.001-.6c.041-.368.055-.35-1.884-2.295L10.901 12l1.805-1.81c1.942-1.948 1.925-1.927 1.883-2.299-.053-.474-.618-.785-1.049-.577"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeft24;
