interface Window {
  onFootprintCanceled?: () => void;
  onFootprintCompleted?: (validationToken: string) => void;
  onFootprintFailed?: () => void;
}
