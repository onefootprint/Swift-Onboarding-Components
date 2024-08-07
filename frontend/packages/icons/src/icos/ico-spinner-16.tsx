import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpinner16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.872 1.229a.591.591 0 0 0-.489.603.64.64 0 0 0 .377.577c.053.022.242.046.44.056 1.644.087 3.027.767 4.056 1.995.765.913 1.189 1.987 1.266 3.206.032.516.053.599.18.74a.616.616 0 0 0 1.063-.246c.081-.277-.019-1.213-.204-1.908a6.77 6.77 0 0 0-3.46-4.287c-.84-.427-1.74-.682-2.558-.725-.159-.008-.35-.019-.423-.024-.073-.005-.185 0-.248.013"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpinner16;
