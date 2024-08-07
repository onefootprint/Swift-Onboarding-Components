import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowRightSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.205 3.23a.617.617 0 0 0-.458.383.724.724 0 0 0 .022.472c.038.085.47.532 1.628 1.688a90.718 90.718 0 0 1 1.576 1.594c0 .011-2.167.02-4.816.02-4.496 0-4.822.003-4.912.045a.63.63 0 0 0-.353.693.656.656 0 0 0 .334.434l.133.068 4.813.007 4.814.007-1.592 1.593c-1.149 1.15-1.604 1.622-1.635 1.696a.627.627 0 0 0 .449.845.475.475 0 0 0 .301-.014l.158-.045 2.167-2.165c1.459-1.457 2.184-2.199 2.218-2.271a.567.567 0 0 0 .042-.458c-.045-.155-.049-.16-2.209-2.323-1.487-1.488-2.198-2.183-2.272-2.217a.639.639 0 0 0-.408-.052"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowRightSmall16;
