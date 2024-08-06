import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoQuestionMark24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.333 9.917V9.5c0-.46.373-.833.834-.833h1.666c.46 0 .834.373.834.833v.833c0 .263-.124.51-.334.667l-1 .75a.833.833 0 0 0-.333.667v.416m0 2.5v.009M19.5 12a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoQuestionMark24;
