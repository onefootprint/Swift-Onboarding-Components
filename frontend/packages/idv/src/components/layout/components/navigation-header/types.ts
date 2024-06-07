import type { Color, FontVariant } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';

export type NavigationHeaderBGVariant = 'primary' | 'transparent' | 'dark-glass' | 'light-glass';

// For rendering a dynamic title text in the nav header
export type NavigationHeaderDynamicContent = {
  kind: 'dynamic';
  headerTitleId?: string; // Otherwise uses the default <HeaderTitle/> Title id
  containerId?: string; // Otherwise uses the default <Layout/> Container id
};

export type NavigationHeaderStaticContent = {
  kind: 'static';
  title?: string; // Renders the title text directly in the nav header
};

export type NavigationHeaderLeftButtonProps = NavigationHeaderBackButtonProps | NavigationHeaderCloseButtonProps;

export type NavigationHeaderBackButtonProps = {
  variant: 'back';
  onBack?: () => void;
  color?: Color;
};

export type NavigationHeaderCloseButtonProps = {
  variant: 'close';
  confirmClose?: boolean;
  color?: Color;
};

export type NavigationHeaderRightButtonProps = {
  icon: Icon;
  onClick?: () => void;
  color?: Color;
  label?: string;
};

// We will keep adding new props here as the design demands
export type Style = {
  fontVariant?: FontVariant;
  fontColor?: Color;
  backgroundVariant?: NavigationHeaderBGVariant;
};

export type NavigationHeaderPositionTypes = 'sticky' | 'nonSticky' | 'floating' | 'button-only';

export type NavigationHeaderProps = {
  leftButton?: NavigationHeaderLeftButtonProps; // defaults to no button.
  rightButton?: NavigationHeaderRightButtonProps; // defaults to no button.
  content?: NavigationHeaderDynamicContent | NavigationHeaderStaticContent; // Defaults to dynamic
  position?: NavigationHeaderPositionTypes;
  style?: Style;
};
