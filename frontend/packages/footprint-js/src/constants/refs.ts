import { ComponentKind } from '../types/components';

const RefsByComponent: Record<ComponentKind, string[]> = {
  [ComponentKind.Form]: ['getRef'],
  [ComponentKind.Verify]: [],
  [ComponentKind.VerifyButton]: [],
  [ComponentKind.Render]: [],
};

export default RefsByComponent;
