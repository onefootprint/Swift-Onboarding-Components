import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSparkles16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M12.834 8.667c-3.37.291-5.209 2.13-5.5 5.5-.304-3.422-2.134-5.119-5.5-5.5 3.42-.395 5.105-2.08 5.5-5.5.38 3.367 2.077 5.196 5.5 5.5Z"
          stroke={theme.color[color]}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.193.84a.194.194 0 0 0-.386-.001c-.074.638-.265 1.087-.573 1.395-.308.308-.757.5-1.395.573a.194.194 0 0 0 0 .386c.628.071 1.087.262 1.402.572.314.308.509.757.565 1.391a.194.194 0 0 0 .388 0c.054-.624.248-1.082.564-1.398.316-.316.774-.51 1.398-.564a.195.195 0 0 0 0-.388c-.634-.056-1.083-.25-1.391-.565-.31-.315-.5-.774-.572-1.402Z"
          fill={theme.color[color]}
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
export default IcoSparkles16;
