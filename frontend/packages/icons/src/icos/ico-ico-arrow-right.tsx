import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIcoArrowRight = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.32 2.517c-.235.111-.36.299-.36.542 0 .299-.107.176 2.029 2.315a140.445 140.445 0 0 1 1.971 1.993c0 .011-2.61.02-5.801.02-6.408 0-5.897-.014-6.089.168A.592.592 0 0 0 .881 8a.63.63 0 0 0 .386.579c.101.045.386.048 5.906.055l5.799.007-1.977 1.979c-2.148 2.151-2.035 2.022-2.034 2.327.001.326.28.599.612.599.261 0 .126.123 2.876-2.621 1.769-1.766 2.585-2.598 2.62-2.672a.68.68 0 0 0 0-.506c-.035-.074-.849-.904-2.62-2.671C9.684 2.315 9.836 2.453 9.56 2.454a.68.68 0 0 0-.24.063"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIcoArrowRight;
