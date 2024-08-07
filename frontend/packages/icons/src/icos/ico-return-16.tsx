import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoReturn16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.613 1.896c-1.361.075-2.489.558-3.6 1.542l-.213.189-.013-.58c-.015-.647-.021-.67-.208-.839-.136-.122-.264-.163-.471-.15a.59.59 0 0 0-.494.329l-.067.132v2.694l.083.174a.964.964 0 0 0 .785.563c.106.015.698.023 1.366.018 1.067-.007 1.189-.013 1.286-.056.418-.188.519-.717.196-1.024-.169-.161-.212-.168-1.022-.168-.404 0-.734-.009-.734-.02 0-.027.365-.359.626-.569a4.382 4.382 0 0 1 1.887-.906 4.887 4.887 0 0 1 4.415 1.316 4.938 4.938 0 0 1 1.381 2.619c.069.378.069 1.302 0 1.68a4.938 4.938 0 0 1-1.381 2.619 4.848 4.848 0 0 1-5.548.926A4.882 4.882 0 0 1 3.453 9.72c-.122-.312-.247-.435-.5-.492a.62.62 0 0 0-.745.596c.001.154.06.329.253.749a6.095 6.095 0 0 0 2.856 2.919 6.102 6.102 0 0 0 7.017-1.158c1.003-1.002 1.603-2.251 1.773-3.693a8.07 8.07 0 0 0 0-1.282c-.196-1.664-.995-3.122-2.267-4.138-1.198-.957-2.649-1.411-4.227-1.325"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoReturn16;
