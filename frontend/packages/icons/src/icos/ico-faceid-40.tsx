import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFaceid40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
          d="M13.333 6.667h-5c-.92 0-1.667.746-1.667 1.666v5m0 13.334v5c0 .92.747 1.666 1.667 1.666h5M26.666 6.667h5c.921 0 1.667.746 1.667 1.666v5m0 13.334v5c0 .92-.746 1.666-1.666 1.666h-5m-5.834-18.75v3.75a3.335 3.335 0 0 1-2.5 3.229m-5-6.562v1.667M26.666 15v1.667M15 26.162a9.953 9.953 0 0 0 5 1.338c1.821 0 3.529-.487 5-1.338"
          stroke={theme.color[color]}
          strokeWidth={3.333}
          strokeLinecap="round"
          strokeLinejoin="round"
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
export default IcoFaceid40;
