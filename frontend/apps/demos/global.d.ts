interface Window {
  onFootprintCanceled?: () => void;
  onFootprintCompleted?: (footprintUserId: string) => void;
  onFootprintFailed?: () => void;
}
