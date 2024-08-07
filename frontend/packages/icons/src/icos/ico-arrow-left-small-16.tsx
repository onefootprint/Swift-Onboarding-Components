import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoArrowLeftSmall16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M6.538 3.23a.709.709 0 0 0-.2.074c-.046.029-1.053 1.023-2.236 2.208-2.147 2.15-2.151 2.155-2.196 2.31a.567.567 0 0 0 .042.458c.034.072.759.814 2.218 2.271l2.167 2.165.158.045c.134.039.18.041.301.014a.627.627 0 0 0 .449-.845c-.031-.074-.486-.546-1.635-1.696L4.014 8.641l4.814-.007 4.813-.007.133-.068c.374-.193.465-.694.177-.981-.209-.21.28-.191-5.108-.191-2.649 0-4.816-.009-4.816-.02 0-.011.709-.728 1.576-1.594 1.158-1.156 1.59-1.603 1.628-1.688a.675.675 0 0 0 .053-.261c0-.394-.344-.668-.746-.594"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoArrowLeftSmall16;
