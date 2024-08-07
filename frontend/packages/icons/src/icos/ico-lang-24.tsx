import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLang24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M8.295 4.477a1.093 1.093 0 0 0-.24.226c-.114.149-.115.157-.128.784l-.013.633H6.407c-1.491 0-1.509.001-1.654.09-.529.323-.492 1.061.065 1.315.119.054.26.073.526.074l.363.001.051.29c.077.441.299 1.281.463 1.75.258.739.74 1.666 1.106 2.129.067.084.112.175.101.203-.027.071-.817.476-1.249.641-.198.075-.529.185-.737.244-.467.135-.571.187-.7.357a.746.746 0 0 0 .405 1.166c.232.059.419.022 1.205-.241.637-.212 1.397-.569 1.868-.876l.343-.223.199.158c.29.229.814.537 1.334.784.604.288 1.623.629 1.884.631.679.007 1.021-.781.546-1.256-.114-.114-.225-.17-.506-.254-.843-.253-1.467-.525-2.046-.891l-.286-.181.198-.246c.783-.967 1.348-2.259 1.667-3.805l.075-.36.421-.022c.379-.019.436-.033.564-.13.207-.158.307-.32.334-.54a.746.746 0 0 0-.289-.672l-.152-.116-1.528-.011-1.528-.012-.018-.588c-.019-.636-.047-.739-.258-.934-.173-.16-.267-.195-.521-.195-.159 0-.273.025-.358.077m1.768 3.273c-.19 1.082-.764 2.401-1.352 3.105l-.096.116-.12-.156c-.282-.362-.618-1.014-.854-1.655-.11-.299-.401-1.398-.401-1.516 0-.031.419-.044 1.424-.044h1.425l-.026.15m5.707 1.749c-.456.128-.829.423-1.001.79-.049.104-.719 1.856-1.489 3.894-.976 2.583-1.4 3.752-1.4 3.862a.69.69 0 0 0 .253.544c.206.18.424.239.656.177.377-.101.464-.229.831-1.226l.191-.52h2.354c2.055 0 2.357.008 2.378.06l.264.7c.265.703.368.853.66.965.467.178.985-.192.981-.702-.002-.141-.323-1.034-1.384-3.843-.759-2.013-1.437-3.772-1.506-3.908-.318-.633-1.109-.984-1.788-.793m.804 2.371.858 2.27.515 1.36-1.76.01c-.968.006-1.767.003-1.777-.007-.016-.016 1.598-4.326 1.676-4.473.086-.163.151-.051.488.84"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLang24;
