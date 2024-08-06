import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoApple16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)">
        <path
          d="M13.336 4.772A3.171 3.171 0 0 0 11.82 7.44a3.086 3.086 0 0 0 1.879 2.83 7.376 7.376 0 0 1-.962 1.988c-.599.862-1.225 1.724-2.178 1.724-.952 0-1.197-.554-2.295-.554-1.071 0-1.452.572-2.323.572s-1.48-.799-2.178-1.778a8.595 8.595 0 0 1-1.46-4.637c0-2.722 1.769-4.165 3.51-4.165.926 0 1.698.608 2.278.608.554 0 1.416-.644 2.468-.644a3.302 3.302 0 0 1 2.777 1.388Zm-3.276-2.54a3.13 3.13 0 0 0 .744-1.95c.001-.095-.008-.19-.027-.282a3.135 3.135 0 0 0-2.06 1.062 3.043 3.043 0 0 0-.771 1.896c0 .085.01.17.027.254.063.012.127.018.19.018a2.718 2.718 0 0 0 1.897-.998Z"
          fill={theme.color[color]}
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoApple16;
