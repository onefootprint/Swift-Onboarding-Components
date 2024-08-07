import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLightBulb16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.606 1.229c-1.436.089-2.842.805-3.785 1.928a5.454 5.454 0 0 0 1.116 8.026l.257.177.013.847c.01.625.024.892.054 1.02.287 1.23 1.223 2.069 2.469 2.214a2.7 2.7 0 0 0 1.04-.097 2.786 2.786 0 0 0 1.906-1.904c.097-.34.124-.636.124-1.391v-.685l.287-.199a5.473 5.473 0 0 0 1.993-2.506 5.438 5.438 0 0 0-.714-5.261 5.138 5.138 0 0 0-.844-.896c-1.112-.93-2.442-1.363-3.916-1.273M8.31 2.48a4.13 4.13 0 0 1 2.66 1.217 4.229 4.229 0 0 1 1.017 4.319 4.747 4.747 0 0 1-.489.984 4.308 4.308 0 0 1-1.225 1.21c-.387.26-.547.454-.665.803l-.058.174-1.558.007-1.558.006-.017-.1c-.027-.167-.168-.427-.316-.584a3.093 3.093 0 0 0-.411-.333A4.21 4.21 0 0 1 3.924 5.64 4.206 4.206 0 0 1 7.76 2.471a6.2 6.2 0 0 0 .187-.012c.022-.003.185.007.363.021m1.236 10.127c-.003.468-.156.838-.476 1.153a1.5 1.5 0 0 1-1.758.288 1.442 1.442 0 0 1-.392-.301c-.314-.314-.43-.576-.459-1.034l-.016-.26h3.102l-.001.154"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLightBulb16;
