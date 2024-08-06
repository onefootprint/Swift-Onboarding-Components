import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCirclePlay16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.7 1C4 1 1 4 1 7.7s3 6.7 6.7 6.7 6.7-3 6.7-6.7S11.4 1 7.7 1ZM2.4 7.7c0-2.926 2.374-5.3 5.3-5.3 2.926 0 5.3 2.374 5.3 5.3 0 2.926-2.374 5.3-5.3 5.3a5.302 5.302 0 0 1-5.3-5.3Zm7.637.29L6.46 10.152a.336.336 0 0 1-.51-.29V5.54a.337.337 0 0 1 .51-.291l3.577 2.16a.34.34 0 0 1 0 .582Z"
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
export default IcoCirclePlay16;
