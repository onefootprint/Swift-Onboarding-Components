// TODO: add appearance support
// https://linear.app/footprint/issue/FP-4516/add-appearance-support-for-secureform-and-securerender

export type SecureRenderProps = {
  authToken: string;
  id: string; // a valid data identifier
  label?: string; // defaults to a nice string chosen for that data identifier
  canCopy?: boolean;
  isHidden?: boolean; // If provided, will show a button to hide/show data
};
