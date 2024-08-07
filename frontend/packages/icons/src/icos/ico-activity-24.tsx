import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoActivity24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M9.161 3.812a1.11 1.11 0 0 0-.325.226c-.179.174-.198.215-.409.882L7.341 8.358c-.475 1.506-.884 2.761-.908 2.79-.034.041-.353.052-1.499.052-1.371 0-1.466.005-1.612.079-.534.272-.527 1.057.011 1.318.176.085.208.086 1.814.075l1.635-.012.268-.132c.328-.162.608-.434.746-.727.057-.122.464-1.361.903-2.754l.799-2.533.07.213c.038.117.962 3.039 2.052 6.492s2.014 6.342 2.054 6.42c.093.18.361.386.578.444.35.095.788-.052 1.005-.335.115-.151.035.089 1.302-3.928l.984-3.12 1.521-.02 1.522-.02.162-.107a.748.748 0 0 0 .27-.903.636.636 0 0 0-.35-.376c-.144-.073-.236-.077-1.82-.066l-1.668.012-.24.118c-.286.139-.61.452-.732.704-.048.1-.447 1.322-.887 2.716a183.662 183.662 0 0 1-.818 2.553c-.01.009-.044-.07-.076-.177-.536-1.794-4.059-12.832-4.129-12.941-.237-.367-.697-.521-1.137-.381"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoActivity24;
