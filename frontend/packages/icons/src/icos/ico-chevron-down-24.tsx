import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChevronDown24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.34 9.667c-.185.098-.265.179-.345.353a.736.736 0 0 0 .004.638c.052.107.616.699 1.631 1.711 1.789 1.783 1.773 1.771 2.37 1.771.597 0 .581.012 2.37-1.771 1.015-1.012 1.579-1.604 1.631-1.711a.778.778 0 0 0-.113-.831c-.179-.198-.569-.284-.835-.185-.062.023-.775.702-1.583 1.51L12 12.62l-1.47-1.468c-.808-.808-1.521-1.487-1.583-1.51-.163-.061-.469-.049-.607.025"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChevronDown24;
