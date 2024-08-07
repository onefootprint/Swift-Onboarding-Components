import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLinkedin16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M2.686 2.029a.913.913 0 0 0-.602.5l-.071.151v10.64l.071.151c.09.191.254.355.445.445l.151.071h10.64l.151-.071a.951.951 0 0 0 .445-.445l.071-.151V2.68l-.071-.151a.951.951 0 0 0-.445-.445l-.151-.071-5.267-.004c-3.015-.002-5.309.006-5.367.02m2.441 1.703c.309.118.575.454.63.796.09.559-.289 1.086-.867 1.206-.295.061-.7-.075-.916-.309a1.054 1.054 0 0 1 .477-1.737 1.31 1.31 0 0 1 .676.044m5.633 3.081c.319.087.595.247.827.479.248.248.374.467.479.829.099.34.119.768.12 2.566l.001 1.526H10.4V10.66c-.001-1.653-.008-1.761-.133-2.026a.864.864 0 0 0-.328-.36c-.064-.035-.149-.047-.339-.047-.227 0-.27.008-.413.078a1.068 1.068 0 0 0-.573.759c-.017.086-.027.743-.027 1.646v1.503H6.8V6.8h1.733l.001.393.001.394.057-.08c.031-.044.138-.16.239-.257.211-.205.572-.402.849-.464.225-.05.853-.034 1.08.027M5.6 9.507v2.706H3.813V6.8H5.6v2.707" />
    </svg>
  );
};
export default IcoLinkedin16;
