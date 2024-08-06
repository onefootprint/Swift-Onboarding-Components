import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoUsers16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        <g clipPath="url(#prefix__b)">
          <path
            d="M9.616 8.787c2.242-.93 5.066.403 5.637 4.002.06.382-.248.711-.635.711h-3.452m-4-8.833a2.167 2.167 0 1 1-4.333 0 2.167 2.167 0 0 1 4.333 0Zm6 0a2.167 2.167 0 1 1-4.333 0 2.167 2.167 0 0 1 4.333 0ZM8.523 13.5H1.382c-.387 0-.695-.331-.635-.713.908-5.716 7.502-5.716 8.41 0 .06.382-.248.713-.634.713Z"
            stroke={theme.color[color]}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
        <clipPath id="prefix__b">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoUsers16;
