import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPlusSmall24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.7 7.156a.734.734 0 0 0-.398.413c-.053.126-.062.41-.062 1.908v1.759l-1.81.012c-1.963.013-1.923.009-2.138.239-.364.389-.223 1.002.277 1.211.126.053.41.062 1.91.062h1.761l.001 1.77c.001 1.635.006 1.782.075 1.93a.743.743 0 0 0 1.368 0c.069-.148.074-.295.075-1.93l.001-1.77 1.77-.001c1.635-.001 1.782-.006 1.93-.075a.734.734 0 0 0 .398-.413c.146-.349-.007-.751-.358-.945-.106-.058-.335-.067-1.93-.078l-1.81-.012-.001-1.768c-.001-1.633-.006-1.78-.075-1.928-.181-.392-.607-.558-.984-.384"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPlusSmall24;
