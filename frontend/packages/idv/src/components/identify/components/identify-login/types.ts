import type { NavigationHeaderLeftButtonProps } from '../../../layout';

export type HeaderProps = {
  title?: string | JSX.Element;
  subtitle?: string | JSX.Element;
  overrideLeftButton?: NavigationHeaderLeftButtonProps;
};
