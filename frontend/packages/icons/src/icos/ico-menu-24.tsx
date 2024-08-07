import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoMenu24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M3.975 6.116a.807.807 0 0 0-.395.441c-.047.153-.029.43.036.556.078.15.316.358.455.396.143.04 15.715.04 15.858 0 .139-.039.377-.246.455-.397.086-.166.079-.482-.014-.662a.916.916 0 0 0-.247-.27l-.17-.12-7.906-.009c-7.654-.009-7.912-.007-8.072.065m.159 5.162a.75.75 0 0 0-.224 1.369l.15.093h15.887l.159-.111c.463-.32.446-.996-.032-1.269l-.174-.1-7.82-.006c-4.301-.004-7.877.007-7.946.024m-.154 5.249c-.129.07-.302.244-.365.364-.064.122-.082.4-.035.552.051.17.225.363.395.44.159.073.434.075 8.025.075s7.866-.002 8.025-.075a.802.802 0 0 0 .395-.44c.047-.152.029-.43-.035-.552a1.052 1.052 0 0 0-.372-.366c-.124-.064-15.918-.062-16.033.002"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoMenu24;
