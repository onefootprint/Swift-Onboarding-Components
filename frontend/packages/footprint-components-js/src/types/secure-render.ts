import { FootprintAppearance } from './appearance';

export type SecureRenderProps = {
  appearance?: FootprintAppearance;
  authToken: string;
  id: string; // a valid data identifier
  label?: string; // defaults to a nice string chosen for that data identifier
  canCopy?: boolean;
  isHidden?: boolean; // If provided, will show a button to hide/show data
};
