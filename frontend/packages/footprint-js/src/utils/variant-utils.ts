import { ComponentKind, Variant } from '../types/components';

const VariantsByKind: Record<ComponentKind, Variant[]> = {
  [ComponentKind.Verify]: ['modal', 'drawer'],
  [ComponentKind.Form]: ['inline', 'modal', 'drawer'],
  [ComponentKind.Render]: ['inline'],
};

export const checkIsVariantValid = (kind: ComponentKind, variant?: any) => {
  if (!variant) {
    return;
  }

  const supportedVariants = VariantsByKind[kind] ?? [];
  const isValid = supportedVariants.includes(variant);
  if (!isValid) {
    throw new Error(
      `Invalid variant: ${JSON.stringify(
        variant,
      )}. Valid variants for ${kind} are ${supportedVariants.join(', ')}`,
    );
  }
};

export const getDefaultVariantForKind = (kind: ComponentKind): Variant => {
  const supportedVariants = VariantsByKind[kind] ?? [];
  if (!supportedVariants.length) {
    throw new Error(`Invalid kind: ${kind}`);
  }
  return supportedVariants[0];
};
