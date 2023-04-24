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

export type NavigationHeaderButtonProps =
  | NavigationHeaderBackButtonProps
  | NavigationHeaderCloseButtonProps;

export type NavigationHeaderBackButtonProps = {
  variant: 'back';
  onBack?: () => void;
};

export type NavigationHeaderCloseButtonProps = {
  variant: 'close';
  confirmClose?: boolean;
};

export type NavigationHeaderProps = {
  button?: NavigationHeaderButtonProps; // defaults to no button
  content?: NavigationHeaderDynamicContent | NavigationHeaderStaticContent; // Defaults to dynamic
};
