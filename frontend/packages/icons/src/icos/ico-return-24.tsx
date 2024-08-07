import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoReturn24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.88 4.46c-1.453.217-2.656.802-3.85 1.869l-.31.277-.003-.693c-.004-.855-.044-.984-.373-1.207-.319-.217-.817-.099-1.031.244l-.093.15v1.72c0 1.667.003 1.726.084 1.9.116.246.347.471.613.596l.223.104 1.505.013c1.641.014 1.88-.006 2.106-.178.401-.307.369-.921-.064-1.219-.137-.094-.166-.096-1.142-.116L7.544 7.9l.379-.351c1.398-1.298 2.934-1.824 4.749-1.627 1.467.16 2.729.783 3.769 1.863a6.103 6.103 0 0 1 1.636 3.363c.055.37.055 1.334 0 1.704a6.093 6.093 0 0 1-1.651 3.377c-1 1.039-2.239 1.66-3.697 1.853-.836.111-1.995-.022-2.812-.323-1.249-.461-2.368-1.364-3.059-2.472-.219-.35-.311-.534-.629-1.251-.166-.375-.478-.536-.889-.459-.186.035-.442.266-.504.455-.093.283-.035.521.317 1.288.539 1.177 1.52 2.284 2.73 3.081 1.904 1.253 4.346 1.564 6.535.833a7.692 7.692 0 0 0 3.961-3.034 8.94 8.94 0 0 0 .876-1.8 7.623 7.623 0 0 0-.786-6.46c-1.149-1.843-3.153-3.151-5.331-3.48-.488-.073-1.77-.073-2.258 0"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoReturn24;
