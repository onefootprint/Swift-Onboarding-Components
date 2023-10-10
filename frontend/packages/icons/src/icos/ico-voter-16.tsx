import { useTheme } from '@onefootprint/styled';
import React from 'react';

import type { IconProps } from '../types';

const IcoVoter16 = ({
  'aria-label': ariaLabel,
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.75 3.48c-.17 0-.3.136-.3.293v8.444c0 .157.13.293.3.293h1.055a.665.665 0 0 1 .012-.052c.231-.81.605-1.693 1.089-2.388.216-.313.485-.629.803-.875a2.399 2.399 0 0 1 1.235-4.459 2.4 2.4 0 0 1 1.234 4.459c.318.246.587.562.804.875.483.695.857 1.578 1.088 2.388a.66.66 0 0 1 .013.052h5.167c.17 0 .3-.136.3-.293V3.773a.297.297 0 0 0-.3-.293H1.75Zm5.164 7.331c.327.471.61 1.084.813 1.699H4.16c.202-.615.485-1.228.812-1.699.408-.586.755-.775.97-.775.216 0 .564.189.971.775ZM.05 3.773c0-.94.766-1.693 1.7-1.693h12.5c.934 0 1.7.754 1.7 1.693v8.444c0 .94-.766 1.693-1.7 1.693H1.75c-.934 0-1.7-.754-1.7-1.693V3.773Zm5.894 2.263a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm5.662-2.028a.4.4 0 0 0-.64.171l-.181.525-.555-.01a.4.4 0 0 0-.38.544l.198.518-.43.349a.4.4 0 0 0 .057.66l.485.27-.106.544a.4.4 0 0 0 .47.47l.544-.107.269.486a.4.4 0 0 0 .66.057l.35-.431.518.199a.4.4 0 0 0 .543-.38l-.01-.555.525-.18a.4.4 0 0 0 .172-.642l-.365-.418.287-.476a.4.4 0 0 0-.28-.601l-.549-.087-.087-.548a.4.4 0 0 0-.6-.28l-.476.286-.419-.364Zm-.16 1.231.083-.238.19.165a.4.4 0 0 0 .469.041l.216-.13.04.25a.4.4 0 0 0 .332.332l.249.04-.13.216a.4.4 0 0 0 .041.468l.166.19-.239.083a.4.4 0 0 0-.27.385l.005.252-.236-.09a.4.4 0 0 0-.454.122l-.159.196-.122-.22a.4.4 0 0 0-.427-.2l-.247.048.048-.247a.4.4 0 0 0-.199-.427l-.22-.122.196-.158a.4.4 0 0 0 .121-.455l-.09-.235.252.004a.4.4 0 0 0 .386-.27Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoVoter16;
