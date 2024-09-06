import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCheck16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path
        d="M13.807 2.411a.634.634 0 0 0-.333.252c-.056.07-1.619 2.175-3.474 4.678a526.38 526.38 0 0 1-3.394 4.551c-.011.001-.742-.594-1.625-1.322a77.668 77.668 0 0 0-1.699-1.38c-.073-.043-.14-.057-.284-.057-.164 0-.206.011-.319.081a.62.62 0 0 0-.268.726.653.653 0 0 0 .197.278c.319.3 3.746 3.105 3.866 3.163.101.05.156.059.282.049.318-.025.035.33 4.076-5.11 2.02-2.721 3.699-4.998 3.73-5.061a.675.675 0 0 0 .011-.504.627.627 0 0 0-.766-.344"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheck16;
