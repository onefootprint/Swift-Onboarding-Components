import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoChartUp40 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={40}
      height={40}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30.614 7.93a.545.545 0 0 0-.545.545v23.062c0 .3.244.545.545.545h.922c.301 0 .545-.244.545-.545V8.475c0-.301-.244-.545-.545-.545h-.922Zm-3.145.545a3.145 3.145 0 0 1 3.145-3.145h.922a3.145 3.145 0 0 1 3.145 3.145v23.062a3.145 3.145 0 0 1-3.145 3.145h-.922a3.145 3.145 0 0 1-3.145-3.145V8.475ZM15.483 7.93l-9.772 9.773a1.3 1.3 0 0 0 1.838 1.838l9.773-9.773v3.32a1.3 1.3 0 0 0 2.6 0V6.63a1.3 1.3 0 0 0-1.3-1.3h-6.457a1.3 1.3 0 1 0 0 2.6h3.318ZM8.475 26.38a.545.545 0 0 0-.545.544v4.613c0 .3.244.545.545.545h.922a.545.545 0 0 0 .545-.545v-4.613a.545.545 0 0 0-.545-.545h-.922Zm-3.145.544a3.145 3.145 0 0 1 3.145-3.145h.922a3.145 3.145 0 0 1 3.145 3.145v4.613a3.145 3.145 0 0 1-3.145 3.145h-.922a3.145 3.145 0 0 1-3.145-3.145v-4.613ZM19 21.389c0-.3.243-.545.544-.545h.923c.3 0 .545.244.545.545v10.148a.545.545 0 0 1-.545.545h-.923a.545.545 0 0 1-.544-.545V21.389Zm.544-3.145A3.145 3.145 0 0 0 16.4 21.39v10.148a3.145 3.145 0 0 0 3.145 3.145h.923a3.145 3.145 0 0 0 3.145-3.145V21.389a3.145 3.145 0 0 0-3.145-3.145h-.923Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoChartUp40;
