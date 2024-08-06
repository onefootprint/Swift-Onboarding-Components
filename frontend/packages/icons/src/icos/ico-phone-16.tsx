import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPhone16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M6.122 2.869a.667.667 0 0 0-.597-.369H3.167a.667.667 0 0 0-.667.667v.708a9.625 9.625 0 0 0 9.625 9.625h.708a.667.667 0 0 0 .667-.667v-2.358a.667.667 0 0 0-.368-.597l-1.952-.976a.667.667 0 0 0-.77.125l-.38.38a.636.636 0 0 1-.715.138c-1.35-.625-2.235-1.51-2.86-2.86a.636.636 0 0 1 .137-.715l.38-.38a.667.667 0 0 0 .126-.77L6.122 2.87Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoPhone16;
