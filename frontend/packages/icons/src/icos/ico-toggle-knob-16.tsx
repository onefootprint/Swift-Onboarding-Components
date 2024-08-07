import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoToggleKnob16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.56 2.016c-.876.091-1.5.26-2.187.596A5.992 5.992 0 0 0 2.04 7.328c-.262 2.24.786 4.452 2.707 5.712a6.471 6.471 0 0 0 1.981.825 6.007 6.007 0 0 0 6.661-3.238 5.964 5.964 0 0 0 0-5.254 5.952 5.952 0 0 0-2.76-2.758 5.76 5.76 0 0 0-1.749-.548c-.272-.041-1.105-.073-1.32-.051"
        fill={theme.color[color]}
        fillRule="evenodd"
      />
    </svg>
  );
};
export default IcoToggleKnob16;
