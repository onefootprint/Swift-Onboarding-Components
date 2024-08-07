import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusBig24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.633 4.69a.766.766 0 0 0-.347.426c-.033.098-.046.963-.046 3.129v2.993l-3.05.011-3.05.011-.18.106c-.553.325-.459 1.138.156 1.348.098.033.963.046 3.13.046h2.994v2.994c0 3.112.002 3.147.169 3.366.287.374.895.374 1.182 0 .167-.219.169-.254.169-3.366V12.76h2.994c2.167 0 3.032-.013 3.13-.046.617-.211.708-1.035.15-1.354l-.174-.1-3.05-.011-3.05-.011V8.245c0-3.111-.002-3.146-.169-3.365-.216-.281-.663-.37-.958-.19"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusBig24;
