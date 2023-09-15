import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const ThemedLogoFpdocsDefault = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={144}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        d="M23.333 4.384h7.552v1.82h-5.463V9.82h5.017v1.822h-5.017v5.24h-2.09M39.043 12.383c0-1.732-1.089-2.946-2.678-2.946-1.607 0-2.679 1.214-2.679 2.946 0 1.732 1.072 2.946 2.679 2.946 1.59 0 2.678-1.214 2.678-2.946Zm-7.32 0c0-2.696 1.928-4.643 4.642-4.643 2.696 0 4.642 1.947 4.642 4.643 0 2.696-1.946 4.642-4.642 4.642-2.715 0-4.643-1.946-4.642-4.642ZM49.385 12.383c0-1.732-1.09-2.946-2.679-2.946-1.607 0-2.678 1.214-2.678 2.946 0 1.732 1.072 2.947 2.678 2.947 1.59 0 2.679-1.215 2.679-2.947Zm-7.32 0c0-2.696 1.928-4.642 4.641-4.642 2.697 0 4.643 1.946 4.643 4.642 0 2.697-1.946 4.643-4.643 4.643-2.714 0-4.642-1.947-4.642-4.643ZM66.659 12.384c0-1.786-1.036-2.946-2.607-2.946-1.571 0-2.607 1.16-2.607 2.945 0 1.768 1.036 2.947 2.607 2.947 1.57 0 2.607-1.179 2.607-2.946Zm-7.036-4.5h1.947v1.143c.5-.732 1.553-1.286 2.803-1.286 2.66 0 4.232 1.929 4.232 4.643-.001 2.714-1.643 4.642-4.34 4.642-1.089 0-2.142-.465-2.695-1.179v4.286h-1.947M77.265 7.884h1.947l-.002 9h-1.945v-9Zm-.287-2.75c0-.713.536-1.267 1.25-1.267.733 0 1.287.554 1.287 1.268 0 .696-.555 1.25-1.286 1.25a1.23 1.23 0 0 1-1.25-1.25ZM81.552 7.884H83.5v1.5c.606-.964 1.642-1.642 2.964-1.642 1.91 0 3.249 1.268 3.249 3.214v5.928h-1.947l.001-5.482c0-1.125-.696-1.91-1.839-1.91-1.518 0-2.428 1.285-2.428 3.446l-.001 3.946h-1.946M75.784 7.863a3.17 3.17 0 0 0-.888-.121c-1.088 0-2.267.785-2.75 1.857V7.884H70.2v9h1.947v-3.357c0-2.785 1.16-3.964 2.482-3.964.408 0 .834.07 1.155.212M57.736 15.065c-.34.16-.8.23-1.14.23-.732 0-1.232-.466-1.232-1.358V9.545h2.365V7.884h-2.365V5.205H53.42v2.677h-1.572v1.661h1.572v4.5c0 2.053 1.267 2.982 2.963 2.982.452 0 .954-.077 1.354-.194M96.61 15.066c-.339.16-.8.23-1.14.23-.732 0-1.232-.465-1.232-1.358l.001-4.392h2.364V7.885h-2.364V5.206h-1.946v2.677H90.72v1.661h1.572v4.5c0 2.053 1.267 2.982 2.963 2.982a5.08 5.08 0 0 0 1.354-.194M10 14.5h3.334v-2.95c-.491.285-1.06.45-1.667.45a3.333 3.333 0 1 1 1.667-6.217V2H0v20h5.834v-3.334c0-2.3 1.865-4.166 4.166-4.166Z"
        fill={theme.color[color]}
      />
      <path
        d="M106.136 17V5.8h3.632c1.312 0 2.389.23 3.232.688.853.459 1.483 1.11 1.888 1.952.416.832.624 1.824.624 2.976 0 1.141-.208 2.133-.624 2.976-.405.832-1.035 1.477-1.888 1.936-.843.448-1.92.672-3.232.672h-3.632Zm1.696-1.44h1.872c1.013 0 1.813-.165 2.4-.496a2.823 2.823 0 0 0 1.28-1.424c.267-.619.4-1.36.4-2.224 0-.864-.133-1.61-.4-2.24a2.815 2.815 0 0 0-1.28-1.44c-.587-.341-1.387-.512-2.4-.512h-1.872v8.336Zm13.202 1.632c-.757 0-1.44-.17-2.048-.512a3.89 3.89 0 0 1-1.424-1.456c-.352-.63-.528-1.36-.528-2.192 0-.832.176-1.557.528-2.176a3.82 3.82 0 0 1 1.456-1.456 3.98 3.98 0 0 1 2.032-.528c.757 0 1.435.176 2.032.528a3.707 3.707 0 0 1 1.44 1.456c.363.619.544 1.344.544 2.176 0 .832-.181 1.563-.544 2.192a3.852 3.852 0 0 1-1.44 1.456c-.608.341-1.291.512-2.048.512Zm0-1.456a2.22 2.22 0 0 0 1.968-1.2c.213-.405.32-.907.32-1.504s-.107-1.093-.32-1.488a2.104 2.104 0 0 0-.832-.912 2.154 2.154 0 0 0-1.12-.304 2.24 2.24 0 0 0-1.136.304c-.341.203-.619.507-.832.912-.213.395-.32.89-.32 1.488 0 .597.107 1.099.32 1.504.213.395.491.693.832.896.341.203.715.304 1.12.304Zm9.626 1.456c-.779 0-1.477-.176-2.096-.528a3.852 3.852 0 0 1-1.44-1.456c-.341-.63-.512-1.355-.512-2.176 0-.821.171-1.541.512-2.16a3.82 3.82 0 0 1 1.44-1.472c.619-.352 1.317-.528 2.096-.528.981 0 1.803.256 2.464.768.672.512 1.104 1.205 1.296 2.08h-1.776a1.67 1.67 0 0 0-.704-1.024c-.363-.245-.789-.368-1.28-.368-.416 0-.8.107-1.152.32a2.199 2.199 0 0 0-.848.912c-.213.395-.32.885-.32 1.472s.107 1.083.32 1.488c.213.395.496.699.848.912.352.213.736.32 1.152.32.491 0 .917-.123 1.28-.368s.597-.592.704-1.04h1.776a3.435 3.435 0 0 1-1.28 2.064c-.672.523-1.499.784-2.48.784Zm8.768 0c-1.003 0-1.83-.245-2.48-.736a2.755 2.755 0 0 1-1.12-1.952h1.711c.086.363.289.677.609.944.32.256.741.384 1.263.384.513 0 .886-.107 1.121-.32.234-.213.352-.459.352-.736 0-.405-.166-.677-.496-.816-.32-.15-.768-.283-1.344-.4a10.594 10.594 0 0 1-1.344-.384 3.088 3.088 0 0 1-1.104-.672c-.288-.299-.432-.699-.432-1.2 0-.693.266-1.27.8-1.728.533-.47 1.28-.704 2.24-.704.885 0 1.6.213 2.144.64.554.427.88 1.03.976 1.808h-1.632a1.17 1.17 0 0 0-.48-.8c-.256-.192-.603-.288-1.04-.288-.427 0-.758.09-.992.272a.793.793 0 0 0-.352.672c0 .277.16.496.48.656.33.16.762.304 1.296.432.533.117 1.024.256 1.472.416.458.15.826.373 1.104.672.277.299.416.736.416 1.312.01.725-.272 1.328-.848 1.808-.566.48-1.339.72-2.32.72Z"
        fill="#707070"
      />
    </svg>
  );
};
export default ThemedLogoFpdocsDefault;
