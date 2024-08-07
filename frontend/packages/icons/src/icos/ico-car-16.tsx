import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoCar16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
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
        d="M4.187 2.561a1.24 1.24 0 0 0-.767.411c-.07.076-.606.908-1.193 1.847L1.161 6.527l-.401.012c-.433.013-.549.042-.687.174L0 6.783v.766l.073.069c.137.129.263.167.547.168l.26.001v2.288c0 2.027.005 2.305.043 2.433.143.483.534.843 1.009.93.205.037 1.265.037 1.47 0 .577-.106 1.051-.654 1.051-1.216v-.142h7.094v.142c0 .562.474 1.11 1.051 1.216.205.037 1.265.037 1.47 0a1.313 1.313 0 0 0 1.009-.93c.038-.128.043-.406.043-2.433V7.787l.26-.001c.284-.001.41-.039.547-.168L16 7.549v-.766l-.073-.07c-.138-.132-.254-.161-.687-.174l-.401-.012-1.066-1.708c-.587-.939-1.123-1.771-1.193-1.847a1.31 1.31 0 0 0-.56-.368l-.167-.057-3.76-.004c-2.068-.002-3.826.006-3.906.018m8.571 2.999 1.109 1.773v4.88H12.8v-.401c0-.221-.014-.458-.031-.527a.697.697 0 0 0-.428-.427c-.179-.045-8.503-.045-8.682 0a.697.697 0 0 0-.428.427 3.428 3.428 0 0 0-.031.527v.401H2.133v-4.88L3.242 5.56 4.35 3.787h7.3l1.108 1.773M3.553 8.136a.631.631 0 0 0-.329.676.662.662 0 0 0 .278.406l.111.075.839.008c.958.01.988.005 1.171-.193a.61.61 0 0 0-.026-.86c-.172-.163-.204-.168-1.109-.168-.782 0-.827.003-.935.056m7.02-.005a.688.688 0 0 0-.318.328.706.706 0 0 0 .008.488.718.718 0 0 0 .369.333c.068.021.369.028.928.022l.827-.009.111-.075a.662.662 0 0 0 .278-.406.63.63 0 0 0-.331-.676c-.109-.053-.157-.056-.94-.055-.747 0-.835.005-.932.05"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCar16;
