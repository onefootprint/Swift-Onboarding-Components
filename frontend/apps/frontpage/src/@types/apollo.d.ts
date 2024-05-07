interface Window {
  trackingFunctions?: {
    onLoad: (options: { appId: string }) => void;
  };
}
