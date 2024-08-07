import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinusBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M2.24 7.434a.63.63 0 0 0-.348.691.656.656 0 0 0 .334.434l.133.068h11.282l.133-.068a.656.656 0 0 0 .334-.434.63.63 0 0 0-.353-.693c-.09-.042-.462-.045-5.759-.045-5.3.001-5.669.004-5.756.047"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinusBig16;
