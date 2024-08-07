import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSpinner40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M18.133 4.592v1.875h1.26c2.686 0 4.489.377 6.507 1.362 2.792 1.363 4.908 3.479 6.271 6.271.985 2.018 1.362 3.821 1.362 6.507v1.26h3.8l-.001-.717c-.003-1.255-.123-3.059-.26-3.901-.459-2.815-1.521-5.305-3.264-7.649-.626-.842-2.217-2.485-3.008-3.107-1.772-1.392-3.904-2.498-5.952-3.086-1.695-.487-2.635-.614-4.865-.655l-1.85-.035v1.875"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSpinner40;
