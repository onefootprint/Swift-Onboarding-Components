import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBroadcast24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.55 6.55A7.684 7.684 0 0 0 4.291 12c0 2.13.862 4.056 2.257 5.451m2.423-8.479a4.269 4.269 0 0 0-1.255 3.029c0 1.182.48 2.253 1.255 3.028m6.056 0A4.269 4.269 0 0 0 16.282 12c0-1.183-.48-2.254-1.254-3.029m2.422 8.48A7.684 7.684 0 0 0 19.708 12a7.684 7.684 0 0 0-2.258-5.45M12.625 12a.625.625 0 1 1-1.25 0 .625.625 0 0 1 1.25 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={12} cy={12} r={0.625} fill={theme.color[color]} />
    </svg>
  );
};
export default IcoBroadcast24;
