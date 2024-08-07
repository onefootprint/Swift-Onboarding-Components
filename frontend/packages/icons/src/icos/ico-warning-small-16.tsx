import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoWarningSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.605 3.735c-.096.048-.21.134-.274.207-.144.162-3.712 6.256-3.757 6.415a.945.945 0 0 0 .502 1.079l.151.071h7.546l.151-.071a.903.903 0 0 0 .525-.788.84.84 0 0 0-.033-.318c-.063-.187-3.609-6.233-3.744-6.385a1.018 1.018 0 0 0-.277-.21c-.145-.072-.19-.082-.395-.082-.205 0-.25.01-.395.082m2.096 3.89a395.184 395.184 0 0 1 1.686 2.893c0 .008-1.524.015-3.387.015s-3.387-.006-3.387-.015c0-.026 3.372-5.771 3.387-5.771.009 0 .774 1.295 1.701 2.878M7.753 6.322a.567.567 0 0 0-.173.163l-.073.111-.009.842c-.009.922-.002.983.136 1.14a.476.476 0 0 0 .732 0c.138-.157.145-.218.136-1.14l-.009-.842-.073-.111a.528.528 0 0 0-.667-.163m-.009 2.702c-.576.268-.381 1.136.256 1.136.508 0 .778-.567.465-.977A.669.669 0 0 0 8 8.961a.695.695 0 0 0-.256.063"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoWarningSmall16;
