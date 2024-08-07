import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCirclePlay16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
      <path d="M7.453 1.084A6.563 6.563 0 0 0 3.124 2.92a6.389 6.389 0 0 0-1.366 1.867 6.538 6.538 0 0 0-.441 4.68 6.62 6.62 0 0 0 3.336 4.11 6.608 6.608 0 0 0 6.454-.198 6.535 6.535 0 0 0 1.268-1.004c.829-.83 1.373-1.745 1.689-2.844a6.332 6.332 0 0 0 .256-1.83c0-2.766-1.698-5.216-4.302-6.206a6.871 6.871 0 0 0-2.565-.411m.67 1.264a5.368 5.368 0 0 1 4.903 4.673 5.376 5.376 0 0 1-3.999 5.885c-.511.131-.879.169-1.474.153-.647-.017-1.023-.083-1.606-.281a5.387 5.387 0 0 1-3.067-2.711c-1.104-2.24-.501-4.979 1.44-6.539a5.328 5.328 0 0 1 2.933-1.179c.376-.032.491-.032.87-.001m-1.99 2.899c-.197.098-.188-.036-.18 2.491l.007 2.259.078.081c.086.09.22.139.315.116.073-.018 3.661-2.178 3.747-2.256.138-.124.127-.354-.023-.488a207.24 207.24 0 0 0-3.642-2.206c-.11-.056-.185-.055-.302.003" />
    </svg>
  );
};
export default IcoCirclePlay16;
