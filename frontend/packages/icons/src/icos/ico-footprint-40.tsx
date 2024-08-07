import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoFootprint40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path d="M11.467 20v12.733H18.924l.027-2.55c.031-2.885.046-2.991.547-4.016.532-1.087 1.307-1.863 2.402-2.403 1.038-.513 1.073-.518 4-.56l2.6-.037.018-1.858c.016-1.754.011-1.855-.1-1.807-.668.283-1.312.453-1.818.48-3.149.17-5.394-3.122-4.082-5.987.54-1.182 1.705-2.129 2.935-2.387.837-.176 2.008-.049 2.679.292.182.091.346.167.366.167.019 0 .035-1.08.035-2.4v-2.4H11.467V20" />
    </svg>
  );
};
export default IcoFootprint40;
