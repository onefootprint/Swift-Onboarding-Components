import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMinusSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.24 7.434a.63.63 0 0 0-.348.691.656.656 0 0 0 .334.434l.133.068h7.282l.133-.068c.374-.193.465-.694.177-.981-.208-.208.142-.191-3.955-.191-3.409.001-3.669.004-3.756.047"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMinusSmall16;
