import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowTopRight24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.1 6.259a1.675 1.675 0 0 1-.149.038.747.747 0 0 0-.256.153c-.42.368-.316.993.205 1.234.149.069.3.074 2.219.075l2.06.001-3.187 3.19c-3.483 3.487-3.27 3.244-3.222 3.672.052.46.622.763 1.042.554.07-.035 1.545-1.479 3.278-3.21l3.15-3.146.001 2.06c.001 1.92.006 2.071.075 2.22.137.295.381.46.684.46.303 0 .547-.165.684-.46.07-.151.074-.325.075-3.16 0-1.943-.014-3.052-.041-3.149a.825.825 0 0 0-.373-.462c-.115-.063-.378-.07-3.165-.076a163.545 163.545 0 0 0-3.08.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowTopRight24;
