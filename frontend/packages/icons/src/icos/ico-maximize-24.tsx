import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMaximize24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.34 4.666a.692.692 0 0 0-.364.4.741.741 0 0 0 .354.929c.17.082.225.085 1.852.085h1.677l-1.925 1.93c-2.069 2.074-2.045 2.046-2.003 2.415a.741.741 0 0 0 1.02.594c.103-.043.744-.657 2.059-1.97l1.91-1.909v1.678c0 1.627.003 1.682.085 1.852.169.349.599.5.963.339a.742.742 0 0 0 .432-.568c.057-.301.053-4.974-.004-5.242-.051-.236-.227-.463-.424-.545-.105-.044-.648-.054-2.821-.052-2.374.001-2.705.009-2.811.064m-8.325 8.328a.758.758 0 0 0-.415.565c-.058.306-.053 4.974.005 5.249a.762.762 0 0 0 .587.587c.275.058 4.943.063 5.249.005.262-.05.464-.199.562-.415a.743.743 0 0 0-.251-.931l-.165-.114-1.714-.02-1.713-.02 1.884-1.88c1.259-1.257 1.909-1.933 1.959-2.04.275-.586-.287-1.218-.908-1.02-.124.039-.54.433-2.085 1.974l-1.93 1.925v-1.677c0-1.605-.004-1.684-.081-1.845a.757.757 0 0 0-.984-.343"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMaximize24;
