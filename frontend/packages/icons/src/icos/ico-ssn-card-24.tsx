import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSsnCard24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M7.625 10.125h3.75m-3.75 2.5h2.1m4.566-2.5h2.084v2.917H14.29v-2.917Zm-9.166 7.917h13.75c.46 0 .833-.373.833-.834V6.792a.833.833 0 0 0-.833-.834H5.125a.833.833 0 0 0-.833.834v10.416c0 .46.373.834.833.834Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSsnCard24;
