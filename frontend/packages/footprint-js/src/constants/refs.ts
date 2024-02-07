import { ComponentKind } from '../types/components';

const RefsByComponent: Record<ComponentKind, string[]> = {
  [ComponentKind.Auth]: [],
  [ComponentKind.Form]: ['getRef'],
  [ComponentKind.Render]: [],
  [ComponentKind.UpdateLoginMethods]: [],
  [ComponentKind.Verify]: [],
  [ComponentKind.VerifyButton]: [],
};

export default RefsByComponent;
