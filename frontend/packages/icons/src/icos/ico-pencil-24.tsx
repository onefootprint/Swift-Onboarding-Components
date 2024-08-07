import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPencil24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M15.26 4.174a1.967 1.967 0 0 0-.34.163C14.696 4.476 4.125 15.04 3.991 15.26c-.225.368-.231.424-.231 2.12 0 1.355.009 1.592.067 1.763.166.492.545.869 1.037 1.032.181.06.392.066 1.82.056L8.3 20.22l.28-.132c.269-.126.494-.346 5.665-5.52 5.85-5.854 5.548-5.528 5.635-6.071a1.638 1.638 0 0 0-.14-.93c-.089-.193-.322-.445-1.572-1.699-1.72-1.724-1.717-1.722-2.367-1.737-.23-.006-.445.011-.541.043m1.83 2.736c.72.72 1.31 1.328 1.31 1.35 0 .023-.315.356-.7.74l-.7.699-1.35-1.349L14.301 7 15 6.3c.384-.385.717-.7.739-.7.022 0 .63.589 1.351 1.31M14.6 9.42l1.34 1.34-4 4-4 4H6.638c-.959 0-1.315-.013-1.35-.048-.035-.035-.048-.391-.048-1.35v-1.301l3.99-3.991a571.73 571.73 0 0 1 4.01-3.99c.011 0 .623.603 1.36 1.34"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPencil24;
