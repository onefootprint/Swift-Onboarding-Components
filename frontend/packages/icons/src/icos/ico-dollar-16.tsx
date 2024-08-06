import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDollar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M8 4.917V4.23m0 6.852v.685m1.484-5.824c-.296-.41-.85-.685-1.484-.685h-.19c-.841 0-1.523.546-1.523 1.218v.053c0 .48.34.92.878 1.136l1.67.668c.538.215.878.655.878 1.136 0 .702-.71 1.27-1.588 1.27H8c-.634 0-1.187-.275-1.484-.684M14.166 8A6.167 6.167 0 1 1 1.834 8a6.167 6.167 0 0 1 12.334 0Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
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
export default IcoDollar16;
