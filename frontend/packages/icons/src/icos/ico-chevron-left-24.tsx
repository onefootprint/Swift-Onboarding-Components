import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronLeft24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M13.1 7.994c-.104.05-.716.636-1.745 1.672-1.475 1.483-1.591 1.61-1.67 1.826a1.552 1.552 0 0 0 0 1.016c.079.216.194.342 1.689 1.842 1.271 1.276 1.639 1.624 1.775 1.675a.736.736 0 0 0 .995-.592c.051-.366.044-.375-1.538-1.963L11.142 12l1.464-1.47c1.582-1.588 1.589-1.597 1.538-1.963a.741.741 0 0 0-1.044-.573"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronLeft24;
