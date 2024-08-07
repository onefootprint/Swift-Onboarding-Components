import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDownload24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.63 4.483a.848.848 0 0 0-.26.245l-.11.166-.011 3.88-.011 3.879-.869-.86c-.941-.932-1.009-.979-1.375-.943-.224.021-.443.171-.573.393-.1.171-.102.487-.004.677.082.159 2.919 3.025 3.16 3.191.132.092.198.109.423.109.225 0 .291-.017.423-.109.241-.166 3.078-3.032 3.16-3.191.229-.444-.083-1.023-.577-1.07-.366-.036-.434.011-1.375.943l-.869.86-.011-3.879-.011-3.88-.11-.166c-.207-.313-.661-.424-1-.245m-6.898 9.184a.92.92 0 0 0-.258.27l-.094.163-.012 1.94c-.007 1.233.005 2.042.032 2.22.056.371.204.654.477.913.268.255.496.369.843.425.357.057 12.2.057 12.56 0 .143-.022.355-.088.47-.146.25-.125.601-.481.721-.732.154-.322.173-.636.161-2.68l-.012-1.94-.094-.163a.752.752 0 0 0-1.276-.049l-.11.166-.011 2.033-.011 2.033H5.882l-.011-2.033-.011-2.033-.11-.166a.755.755 0 0 0-1.018-.221"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoDownload24;
