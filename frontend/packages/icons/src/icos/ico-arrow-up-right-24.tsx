import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowUpRight24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.42 6.259a1.675 1.675 0 0 1-.149.038.747.747 0 0 0-.256.153c-.42.368-.316.993.205 1.234.151.07.323.074 3.06.075l2.9.001-4.311 4.311c-3.972 3.972-4.316 4.327-4.369 4.502-.131.436.148.877.608.961a.855.855 0 0 0 .319-.034c.175-.053.53-.397 4.502-4.369L16.24 8.82l.001 2.9c.001 2.737.005 2.909.075 3.06.286.619 1.082.619 1.368 0 .071-.152.074-.347.075-4 0-2.521-.014-3.891-.041-3.989a.825.825 0 0 0-.373-.462c-.115-.064-.424-.07-4.005-.076a301.13 301.13 0 0 0-3.92.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowUpRight24;
