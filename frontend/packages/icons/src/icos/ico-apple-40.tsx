import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApple40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
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
          d="M33.34 11.93a7.93 7.93 0 0 0-3.789 6.67 7.715 7.715 0 0 0 4.696 7.077 18.437 18.437 0 0 1-2.405 4.968c-1.497 2.155-3.062 4.31-5.444 4.31s-2.994-1.384-5.74-1.384C17.983 33.57 17.03 35 14.853 35c-2.178 0-3.698-1.996-5.444-4.446a21.489 21.489 0 0 1-3.653-11.592c0-6.805 4.424-10.412 8.779-10.412 2.314 0 4.242 1.52 5.694 1.52 1.384 0 3.539-1.61 6.17-1.61a8.254 8.254 0 0 1 6.941 3.47ZM25.15 5.58A7.822 7.822 0 0 0 27.01.703 3.372 3.372 0 0 0 26.942 0a7.838 7.838 0 0 0-5.149 2.654 7.607 7.607 0 0 0-1.928 4.74c0 .214.024.427.068.636.157.03.317.045.476.046a6.794 6.794 0 0 0 4.741-2.497Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h40v40H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoApple40;
