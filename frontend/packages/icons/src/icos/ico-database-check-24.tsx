import React from 'react';
import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoDatabaseCheck24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
      viewBox="0 0 24 24"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.749 3.667c-1.877 0-3.602.25-4.88.672-.635.21-1.195.473-1.608.796-.406.316-.761.766-.761 1.344V17.85c0 .578.355 1.027.761 1.344.413.323.973.586 1.608.796 1.278.422 3.003.672 4.88.672.471 0 .933-.015 1.38-.046a5.016 5.016 0 0 1-.853-1.21c-.174.004-.35.006-.527.006-1.781 0-3.368-.239-4.488-.609-.563-.186-.974-.394-1.23-.594-.266-.207-.281-.333-.281-.359v-2.38c.329.182.708.34 1.12.476 1.277.422 3.002.672 4.879.672h.027c.047-.436.151-.857.304-1.252l-.331.002c-1.781 0-3.368-.239-4.488-.609-.563-.185-.974-.393-1.23-.594-.266-.207-.281-.333-.281-.359v-1.953c.329.182.708.34 1.12.476 1.277.422 3.002.672 4.879.672.865 0 1.698-.053 2.47-.152a4.977 4.977 0 0 1 2.84-.675c.247-.098.479-.205.689-.321v.411c.44.09.86.237 1.25.434V6.48c0-.578-.355-1.028-.761-1.344-.413-.323-.973-.586-1.608-.796-1.278-.422-3.003-.672-4.88-.672ZM5.75 10.19V8.142c.329.183.708.34 1.12.477 1.277.421 3.002.672 4.879.672 1.877 0 3.602-.25 4.88-.672.411-.136.79-.294 1.119-.477v2.048c0 .026-.015.152-.28.359-.257.2-.668.408-1.231.594-1.12.37-2.707.609-4.488.609-1.781 0-3.368-.24-4.488-.609-.563-.186-.974-.394-1.23-.594-.266-.207-.281-.333-.281-.359Zm11.718-3.353c.265-.206.28-.332.28-.358 0-.026-.015-.152-.28-.359-.257-.2-.668-.408-1.231-.594-1.12-.37-2.707-.61-4.488-.61-1.781 0-3.368.24-4.488.61-.563.186-.974.394-1.23.594-.266.207-.281.333-.281.359 0 .026.015.152.28.358.257.2.668.409 1.231.595 1.12.37 2.707.609 4.488.609 1.781 0 3.368-.24 4.488-.61.563-.185.974-.393 1.23-.594Z"
        fill={theme.color[color]}
      />
      <path
        d="M18.6 15.915s-1.33 1.442-1.995 3.104l-1.108-1.33"
        stroke={theme.color[color]}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
export default IcoDatabaseCheck24;
