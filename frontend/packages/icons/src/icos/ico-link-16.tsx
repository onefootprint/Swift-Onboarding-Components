import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLink16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.733 1.23a4.691 4.691 0 0 0-2.572.965 10.27 10.27 0 0 0-.712.657c-.475.472-.5.502-.543.653a.472.472 0 0 0-.014.3.624.624 0 0 0 .814.462c.077-.025.233-.159.586-.501.545-.529.758-.696 1.144-.9a3.25 3.25 0 0 1 1.617-.392c.614 0 1.098.117 1.622.394a3.496 3.496 0 0 1 1.807 2.466c.058.331.058.894 0 1.225a3.612 3.612 0 0 1-.655 1.494 10.29 10.29 0 0 1-.596.659c-.24.246-.458.49-.485.541-.061.119-.062.352-.002.494a.609.609 0 0 0 .749.347c.142-.041.187-.076.566-.449.656-.643.944-1.013 1.219-1.561a4.626 4.626 0 0 0 .504-2.137c0-.58-.082-1.06-.278-1.617a5.184 5.184 0 0 0-.642-1.197A4.713 4.713 0 0 0 9.733 1.23m-.234 4.501a.761.761 0 0 0-.186.092c-.158.109-3.489 3.46-3.543 3.564-.065.124-.067.432-.003.55a.84.84 0 0 0 .296.296c.117.064.426.062.55-.003.122-.064 3.553-3.495 3.617-3.617.065-.124.067-.433.003-.55a.822.822 0 0 0-.287-.29.858.858 0 0 0-.447-.042m-5.982.171a.778.778 0 0 0-.227.117c-.134.108-.844.831-1.002 1.021a4.901 4.901 0 0 0-1.037 2.387 6.101 6.101 0 0 0 0 1.253c.215 1.535 1.16 2.879 2.509 3.571a4.583 4.583 0 0 0 2.187.531c.768 0 1.454-.162 2.137-.504.548-.275.918-.564 1.559-1.216.433-.441.473-.506.474-.758a.604.604 0 0 0-.262-.489.461.461 0 0 0-.297-.104c-.278-.017-.32.009-.851.524-.61.594-.875.792-1.334.999a3.848 3.848 0 0 1-1.426.312c-.568 0-1.3-.202-1.771-.488a3.613 3.613 0 0 1-1.536-1.907 3.321 3.321 0 0 1-.166-1.098c0-.613.117-1.097.394-1.62.203-.385.305-.514.852-1.073.28-.286.504-.538.533-.6.065-.14.066-.394.002-.52a.632.632 0 0 0-.738-.338"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLink16;
