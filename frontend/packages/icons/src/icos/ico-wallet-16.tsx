import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWallet16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <g clipPath="url(#prefix__a)" stroke={theme.color[color]} strokeWidth={1.5} strokeLinejoin="round">
        <path
          d="M2.5 4.333V11.5a2 2 0 0 0 2 2h8.333a.667.667 0 0 0 .667-.667V6.5a.667.667 0 0 0-.667-.667h-2M2.5 4.333a1.5 1.5 0 0 0 1.5 1.5h6.833M2.5 4.333c0-1.012.82-1.833 1.833-1.833h5.98a.52.52 0 0 1 .52.52v2.813"
          strokeLinecap="square"
        />
        <path d="M10.334 10.167a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z" fill={theme.color[color]} />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoWallet16;
