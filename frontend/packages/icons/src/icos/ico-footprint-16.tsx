import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M4 8v6h3.489l.011-1.18c.011-1.17.011-1.182.08-1.439A2.508 2.508 0 0 1 9.381 9.58c.257-.069.269-.069 1.439-.08L12 9.489V7.732l-.127.065c-.281.142-.5.19-.873.189-.287 0-.381-.011-.546-.062A2.016 2.016 0 0 1 9.163 6.78a2.093 2.093 0 0 1 0-1.56c.25-.571.711-.975 1.309-1.145.163-.047.276-.059.528-.059.351 0 .542.04.832.171l.168.076V2H4v6" />
    </svg>
  );
};
export default IcoFootprint16;
