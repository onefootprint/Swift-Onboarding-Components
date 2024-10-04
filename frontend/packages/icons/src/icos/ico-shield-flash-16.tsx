import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoShieldFlash16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M7.667 1.466c-.293.078-4.756 1.62-4.92 1.7-.283.137-.525.42-.645.754l-.062.173v2.16c.001 1.929.006 2.195.048 2.48a5.613 5.613 0 0 0 1.331 2.934c.772.902 1.884 1.694 3.913 2.787.419.226.481.252.631.261.202.013.245-.005 1.002-.423 1.538-.849 2.359-1.402 3.1-2.087.835-.772 1.444-1.761 1.705-2.769.183-.707.209-1.18.198-3.529l-.008-1.814-.062-.173c-.119-.333-.362-.617-.645-.754-.175-.086-4.743-1.659-4.973-1.714a1.163 1.163 0 0 0-.613.014m2.677 2.001c1.28.44 2.333.8 2.339.8.007 0 .008.981.003 2.18-.009 2.14-.01 2.184-.068 2.446a4.288 4.288 0 0 1-.886 1.84c-.493.607-1.256 1.225-2.252 1.827-.392.237-1.448.827-1.48.827-.032 0-1.088-.59-1.48-.827-1.901-1.149-2.826-2.229-3.139-3.668-.056-.258-.058-.329-.067-2.441l-.01-2.176 1.075-.369 2.328-.803a62.99 62.99 0 0 1 1.282-.435c.016-.001 1.076.359 2.355.799m-2.209.938a.714.714 0 0 0-.343.248c-.27.402-1.516 2.507-1.547 2.613a.478.478 0 0 0-.007.291.963.963 0 0 0 .075.227c.075.12.23.272.34.332.103.055.143.058.98.065.481.005.874.015.874.022 0 .008-.344.562-.765 1.232-.42.67-.786 1.266-.812 1.325-.214.47.252.986.754.836.212-.064.274-.149 1.344-1.854a76.22 76.22 0 0 0 1.066-1.727.718.718 0 0 0 .026-.486.73.73 0 0 0-.427-.504c-.132-.064-.138-.064-.98-.065-.465 0-.846-.005-.846-.012 0-.006.217-.369.483-.806.266-.438.506-.843.533-.902a.62.62 0 0 0-.014-.51.583.583 0 0 0-.379-.319.535.535 0 0 0-.355-.006"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoShieldFlash16;
