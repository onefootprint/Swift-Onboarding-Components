import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLaptop40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M7.461 5.122c-1.118.292-2.064 1.25-2.362 2.391C5.014 7.842 5 9.081 5 16.447V25h-.958c-1.046 0-1.337.063-1.746.375a1.98 1.98 0 0 0-.416.485l-.18.307-.019 2.926c-.021 3.157-.006 3.341.322 4.036.243.514.948 1.243 1.446 1.495.781.396-.208.374 16.551.374 16.759 0 15.77.022 16.551-.374.443-.224 1.179-.958 1.401-1.396.373-.736.388-.903.367-4.114l-.019-2.947-.18-.307a1.98 1.98 0 0 0-.416-.485c-.409-.312-.7-.375-1.746-.375H35l-.001-8.517c-.001-9.236.01-8.942-.363-9.679-.226-.444-.808-1.056-1.274-1.336-.82-.493.138-.46-13.362-.46-11.223 0-12.132.008-12.539.114m24.206 11.545V25H8.333V8.333h23.334v8.334M35 30v1.667H5v-3.334h30V30"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLaptop40;
