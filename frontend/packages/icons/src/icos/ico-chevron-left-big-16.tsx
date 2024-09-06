import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeftBig16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.267 2.098c-.056.026-1.118 1.067-2.646 2.593-2.544 2.541-2.552 2.55-2.653 2.762-.101.212-.101.216-.101.547 0 .323.003.34.091.533.09.198.126.235 2.64 2.754 1.785 1.789 2.582 2.571 2.661 2.609.3.146.693 0 .837-.309a.679.679 0 0 0-.001-.507c-.034-.073-.824-.88-2.519-2.573C7.218 9.15 6.107 8.022 6.107 8c0-.022 1.111-1.15 2.469-2.507 1.695-1.693 2.485-2.5 2.519-2.573a.679.679 0 0 0 .001-.507.688.688 0 0 0-.328-.318.787.787 0 0 0-.501.003"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeftBig16;
