import { ComponentKind } from '../types/components';

const checkIsKindValid = (kind: ComponentKind) => {
  if (!kind) {
    throw new Error('Kind is required');
  }
  const isValid = Object.values(ComponentKind).includes(kind);
  if (!isValid) {
    throw new Error(
      `Invalid kind: ${kind}. Valid kinds are: ${Object.values(
        ComponentKind,
      ).join(', ')}}`,
    );
  }
};

export default checkIsKindValid;
