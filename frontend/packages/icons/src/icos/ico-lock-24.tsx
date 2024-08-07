import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoLock24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.281 3.821C9.595 4.126 8.305 5.42 7.98 7.13c-.044.235-.06.602-.06 1.392v1.073l-.671.012c-.665.013-.674.014-.934.143-.473.233-.795.68-.879 1.219-.024.154-.034 1.752-.027 4.131l.011 3.88.094.234c.116.287.363.596.616.77.394.27.067.256 5.87.256s5.476.014 5.87-.256c.253-.174.5-.483.616-.77l.094-.234.012-3.88c.007-2.461-.004-3.974-.029-4.138a1.654 1.654 0 0 0-.914-1.235c-.215-.1-.27-.108-.899-.12l-.67-.012V8.543c0-.746-.017-1.15-.059-1.388a4.075 4.075 0 0 0-3.325-3.335 4.598 4.598 0 0 0-1.415.001m1.339 1.506c.669.141 1.376.712 1.7 1.373.218.442.24.612.24 1.808V9.6H9.435l.014-1.19c.017-1.367.033-1.448.398-1.993.616-.921 1.65-1.328 2.773-1.09m4.44 9.593v3.82H6.94l-.01-3.78c-.006-2.079-.002-3.803.008-3.83.016-.04 1.051-.048 5.071-.04l5.051.01v3.82m-5.36-1.934a.802.802 0 0 0-.384.394c-.068.146-.074.283-.074 1.54 0 1.257.006 1.394.074 1.54.175.38.587.552.955.398a.734.734 0 0 0 .413-.398c.068-.146.074-.284.075-1.531.001-1.471-.008-1.544-.211-1.762-.215-.231-.598-.312-.848-.181"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoLock24;
