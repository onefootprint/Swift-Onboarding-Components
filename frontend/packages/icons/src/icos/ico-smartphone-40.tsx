import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSmartphone40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M10.795 1.789C9.676 2.081 8.73 3.038 8.433 4.18c-.087.333-.1 2.35-.1 15.82 0 16.853-.024 15.761.376 16.551.227.447.959 1.18 1.407 1.407.774.392.329.375 9.872.375 9.568 0 9.121.018 9.907-.381.438-.222 1.172-.958 1.396-1.401.396-.781.374.208.374-16.551 0-16.708.02-15.773-.363-16.529-.225-.445-.808-1.056-1.273-1.336-.808-.486-.251-.461-10.029-.461-8.072 0-8.801.009-9.205.115M28.333 20v15H11.667V5h16.666v15M16.158 30.095a1.724 1.724 0 0 0-.945.765c-.152.26-.18.383-.18.807 0 .426.028.546.185.814.209.355.53.626.899.757.365.131 7.401.131 7.766 0 .369-.131.69-.402.899-.757.157-.268.185-.388.185-.814 0-.424-.028-.547-.18-.807a1.703 1.703 0 0 0-.971-.769c-.428-.128-7.245-.125-7.658.004"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSmartphone40;
