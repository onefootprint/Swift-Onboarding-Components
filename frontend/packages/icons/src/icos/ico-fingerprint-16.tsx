import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFingerprint16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M4.156 12.87c.127-.304.243-.614.349-.93m5.11 2.061a19.778 19.778 0 0 0 .816-3.054m2.695.555c.25-1.35.382-2.744.382-4.167a5.502 5.502 0 0 0-7.91-4.948m-3.424 7.716c.216-.887.33-1.814.33-2.768 0-1.197.382-2.304 1.031-3.207m4.471 3.207a17.177 17.177 0 0 1-1.365 6.727m-1.586-4.32c.131-.783.2-1.587.2-2.407a2.75 2.75 0 0 1 5.502 0c0 .424-.014.845-.04 1.263"
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
export default IcoFingerprint16;
