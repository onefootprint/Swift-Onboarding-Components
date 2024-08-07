import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.18 2.776c-.394.126-.781.437-.95.764-.197.382-.189.037-.19 8.463 0 8.551-.012 8.064.201 8.477.116.227.439.521.719.655l.26.125h9.56l.26-.125c.28-.134.603-.428.719-.655.213-.413.201.074.201-8.48s.012-8.067-.201-8.48c-.116-.227-.439-.521-.719-.655l-.26-.125-4.72-.008c-3.735-.006-4.753.003-4.88.044M16.42 12v7.78H7.58l-.01-7.74c-.006-4.257-.002-7.763.009-7.79.015-.04.922-.048 4.43-.04l4.411.01V12m-6.46 5.317a.743.743 0 0 0-.557.915c.065.23.289.466.497.523.216.06 3.979.062 4.193.002.215-.06.443-.301.501-.531a.729.729 0 0 0-.552-.902c-.228-.049-3.839-.055-4.082-.007"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSmartphone24;
