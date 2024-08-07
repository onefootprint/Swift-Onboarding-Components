import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFilter24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.494 4.444c-.355.103-.772.459-.946.806a1.898 1.898 0 0 0-.146.47c-.054.337-.054 2.503 0 2.84.085.535.05.495 2.605 3.061l2.351 2.36.011 2.96.011 2.959.1.174a.744.744 0 0 0 .606.372c.202.004 3.882-.998 4.134-1.126a.793.793 0 0 0 .381-.484c.023-.081.039-1.085.039-2.494v-2.359l2.352-2.361c2.556-2.567 2.521-2.527 2.606-3.062.054-.337.054-2.503 0-2.84a1.881 1.881 0 0 0-.144-.466c-.13-.259-.449-.572-.734-.72l-.22-.114-6.44-.007c-3.823-.004-6.491.009-6.566.031m12.617 2.694.01 1.238-2.396 2.402c-2.249 2.256-2.401 2.417-2.49 2.642l-.095.24-.012 2.22-.011 2.221-1.069.295c-.587.162-1.09.303-1.117.313-.037.014-.051-.548-.06-2.515l-.011-2.534-.095-.24c-.089-.225-.241-.386-2.49-2.641L5.88 8.377V7.155c0-.672.012-1.234.027-1.248.015-.015 2.764-.023 6.11-.017l6.083.01.011 1.238"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoFilter24;
