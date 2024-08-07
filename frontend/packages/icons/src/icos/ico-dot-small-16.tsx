import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDotSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.449 5.053a3.106 3.106 0 0 0-1.572.832 3.002 3.002 0 0 0 .004 4.234c1.04 1.04 2.712 1.171 3.882.304a2.997 2.997 0 0 0 .911-3.78c-.398-.806-1.242-1.434-2.137-1.591a4.17 4.17 0 0 0-1.088.001"
        fill={theme.color[color]}
        fillRule="evenodd"
      />
    </svg>
  );
};
export default IcoDotSmall16;
