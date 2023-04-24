export type LayoutOptions = {
  header: {
    hideDesktopSandboxBanner?: boolean;
  };
  footer: {
    hideDesktopFooter?: boolean;
    footerVariant?: 'modal' | 'mobile';
  };
  container: {
    hasBorderRadius?: boolean;
  };
};
