import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.289 4.205c-.551.091-1.043.53-1.215 1.085-.071.226-.074.527-.074 6.706 0 5.793.007 6.492.064 6.687.159.545.601.968 1.146 1.097.375.088 11.205.088 11.58 0a1.585 1.585 0 0 0 1.146-1.097c.057-.195.064-.894.064-6.687 0-6.179-.003-6.48-.074-6.706a1.572 1.572 0 0 0-1.251-1.088c-.317-.051-11.077-.049-11.386.003M8.76 12v6.32H6.52V5.68h2.24V12m8.72 0v6.32h-7.24V5.68h7.24V12m-4.94-4.024c-.201.087-.41.353-.442.56a.95.95 0 0 0 0 .293.86.86 0 0 0 .392.5c.166.089.198.091 1.39.091h1.22l.174-.1c.407-.233.512-.773.217-1.124-.221-.262-.295-.274-1.631-.274-.9.001-1.23.014-1.32.054m.2 3.282a1.38 1.38 0 0 1-.147.038c-.254.056-.511.411-.511.704 0 .309.246.632.55.722.097.029.553.039 1.331.031l1.183-.013.162-.107c.476-.315.476-.951 0-1.266l-.162-.107-1.183-.008a26.39 26.39 0 0 0-1.223.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBook24;
