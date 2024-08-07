import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoPhone24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M5.652 4.674c-.578.202-.959.681-1.054 1.327-.047.319-.024 1.454.045 2.199a12.56 12.56 0 0 0 1.802 5.342c.953 1.533 2.479 3.059 4.011 4.012a12.674 12.674 0 0 0 4.444 1.683c.627.106 1.154.153 2.06.184 1.17.039 1.559-.054 1.983-.478.262-.263.4-.543.455-.924.052-.359.053-2.834.001-3.192a1.584 1.584 0 0 0-.46-.927c-.174-.169-.423-.308-1.616-.9l-1.41-.7-.427.001c-.384.002-.449.013-.658.114-.142.069-.368.242-.582.445l-.349.333-.319-.168c-1.175-.619-1.951-1.398-2.612-2.623l-.161-.297.334-.351c.372-.39.525-.664.572-1.022.066-.491.029-.597-.712-2.087-.76-1.527-.856-1.664-1.339-1.905l-.24-.12-1.78-.01c-1.632-.008-1.797-.003-1.988.064m3.997 2.624.609 1.219-.344.351c-.489.501-.624.813-.583 1.349.025.337.162.666.537 1.294a7.557 7.557 0 0 0 3.32 3c.291.138.337.148.692.148.553.001.749-.088 1.23-.553l.375-.363 1.218.609 1.218.608-.011 1.47-.01 1.47-.62.012c-1.894.037-3.557-.344-5.26-1.204a10.287 10.287 0 0 1-2.595-1.866C7.613 13.079 6.512 10.9 6.179 8.418c-.066-.495-.13-2.161-.086-2.274.022-.057.18-.064 1.486-.064H9.04l.609 1.218"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoPhone24;
