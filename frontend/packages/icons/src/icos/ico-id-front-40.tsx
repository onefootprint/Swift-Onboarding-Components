import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoIdFront40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.498 3.405c-1.865.315-3.397 1.676-3.975 3.528l-.156.5v25.134l.156.5a5.147 5.147 0 0 0 3.41 3.41l.5.156h25.2l.511-.174a5.221 5.221 0 0 0 3.315-3.315l.174-.511v-25.2l-.156-.5a5.15 5.15 0 0 0-3.376-3.398l-.534-.168-12.367-.01c-6.802-.005-12.518.016-12.702.048m24.725 3.368c.437.149.879.606 1.009 1.043.089.3.101 1.776.101 12.186 0 9.842-.015 11.895-.091 12.147a1.693 1.693 0 0 1-.769.971l-.306.18H7.833l-.306-.18a2.004 2.004 0 0 1-.486-.416c-.398-.522-.374.29-.374-12.701 0-13.381-.044-12.282.506-12.832.535-.535-.55-.493 12.798-.499 10.783-.005 11.969.005 12.252.101m-21.117 3.332c-.38.139-.678.39-.888.747-.157.268-.185.388-.185.815 0 .426.028.546.185.814.565.96 1.839 1.133 2.617.354a1.64 1.64 0 0 0 0-2.337 1.66 1.66 0 0 0-1.729-.393m5 0c-.38.139-.678.39-.888.747-.157.268-.185.388-.185.815 0 .426.028.546.185.814.565.96 1.839 1.133 2.617.354.299-.299.498-.766.498-1.168 0-1.123-1.175-1.947-2.227-1.562M9.5 14.695a1.302 1.302 0 0 0-.712.912c-.071.341-.064.393.098.748.306.667 1.184 1.482 2.1 1.947.975.495 1.899.698 3.181.698 1.284 0 2.205-.203 3.188-.702.898-.456 1.792-1.286 2.093-1.944.162-.354.169-.406.097-.747-.125-.597-.615-1.007-1.205-1.007-.426 0-.607.109-1.207.724-.869.893-1.571 1.17-2.966 1.17-1.395 0-2.097-.277-2.967-1.17-.312-.32-.651-.614-.754-.653-.255-.096-.703-.085-.946.024m15.73 9.644c-1.213.284-1.246 2.058-.045 2.391.142.04 1.001.069 2 .07 1.874 0 2.05-.026 2.406-.353.21-.193.406-.625.408-.899.001-.27-.157-.661-.352-.87-.342-.366-.408-.377-2.347-.39-.99-.006-1.921.017-2.07.051m-4.063 3.904c-.31.165-.442.301-.575.59-.296.645.009 1.379.69 1.664.213.089.76.103 3.968.103h3.722l.293-.15c.856-.437.976-1.523.231-2.091l-.252-.192-3.939-.015c-3.499-.013-3.961-.003-4.138.091"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoIdFront40;
