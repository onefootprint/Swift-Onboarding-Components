import { ComponentKind } from '../types/components';

const RefsByComponent: Record<ComponentKind, string[]> = {
  [ComponentKind.Auth]: [],
  [ComponentKind.Form]: ['getRef'],
  [ComponentKind.Render]: [],
  [ComponentKind.Verify]: [],
  [ComponentKind.VerifyButton]: [],
};

export default RefsByComponent;
