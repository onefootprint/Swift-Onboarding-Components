import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSettings24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M9.126 6.475 7.632 6.13a.833.833 0 0 0-.776.223l-.504.503a.833.833 0 0 0-.222.776l.344 1.494a.833.833 0 0 1-.35.881l-1.461.975a.833.833 0 0 0-.372.693v.65c0 .279.14.539.372.693l1.462.975a.833.833 0 0 1 .35.88l-.345 1.495c-.065.28.02.573.222.776l.504.503a.833.833 0 0 0 .776.223l1.494-.345a.833.833 0 0 1 .88.35l.976 1.462a.833.833 0 0 0 .693.371h.65c.278 0 .539-.139.693-.37l.975-1.463a.833.833 0 0 1 .88-.35l1.495.345c.28.065.573-.02.776-.223l.503-.503a.833.833 0 0 0 .223-.776l-.345-1.494a.833.833 0 0 1 .35-.881l1.462-.975a.834.834 0 0 0 .371-.693v-.65a.833.833 0 0 0-.37-.693l-1.463-.975a.833.833 0 0 1-.35-.88l.345-1.495a.833.833 0 0 0-.223-.776l-.503-.503a.833.833 0 0 0-.776-.223l-1.494.345a.833.833 0 0 1-.881-.35l-.975-1.462a.833.833 0 0 0-.693-.371h-.65a.833.833 0 0 0-.693.37l-.975 1.463a.833.833 0 0 1-.88.35Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M14.292 12a2.292 2.292 0 1 1-4.583 0 2.292 2.292 0 0 1 4.583 0Z"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoSettings24;
