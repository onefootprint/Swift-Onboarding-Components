import type {
  FootprintAuthProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';
import type { NavigationHeaderLeftButtonProps } from '@onefootprint/idv';

export type Variant = FootprintVariant;
export type HeaderProps = {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  overrideLeftButton?: NavigationHeaderLeftButtonProps;
};
export type FootprintAuthDataProps = Omit<
  FootprintAuthProps,
  'kind' | 'appearance' | 'onCancel' | 'onComplete' | 'onClose'
>;
