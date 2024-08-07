import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoBank24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M11.5 3.513c-.11.041-1.737.844-3.616 1.785-3.798 1.9-3.715 1.851-3.975 2.377-.12.245-.13.296-.143.752-.015.529.034.765.219 1.061.273.434.798.752 1.242.752H5.4v5.26l-.19.1a1.705 1.705 0 0 0-.632.586c-.057.099-.193.448-.301.776-.153.464-.197.654-.197.853 0 .532.25 1.015.68 1.316.447.312-.124.289 7.22.289 5.375 0 6.598-.01 6.77-.054.481-.124.944-.567 1.094-1.048.127-.41.104-.675-.121-1.356-.108-.328-.244-.677-.301-.776a1.705 1.705 0 0 0-.632-.586l-.19-.1v-5.26h.173c.444 0 .969-.318 1.242-.752.185-.296.234-.532.219-1.061-.013-.456-.023-.507-.143-.752-.261-.53-.164-.472-4.104-2.441l-3.542-1.77-.373-.013c-.289-.01-.416.004-.572.062m3.88 3.099L18.74 8.3l.012.173c.007.095-.008.199-.034.23-.072.086-13.364.086-13.436 0-.026-.031-.041-.135-.034-.23L5.26 8.3l3.36-1.688A418.491 418.491 0 0 1 12 4.924c.011 0 1.532.76 3.38 1.688M8.75 12.83l-.01 2.59-.91.011-.91.011V10.24H8.761l-.011 2.59m5 0-.01 2.59h-3.48l-.01-2.59-.011-2.59h3.522l-.011 2.59m3.33.011v2.601l-.91-.011-.91-.011-.01-2.59-.011-2.59H17.08v2.601m1.2 4.539c.081.242.139.463.13.49-.025.073-12.795.073-12.82 0-.014-.039.141-.557.269-.9.015-.04 1.265-.048 6.146-.04l6.128.01.147.44"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoBank24;
