import { ComponentKind } from '../types/components';

type VariantName = 'modal' | 'drawer' | 'inline';
const VariantsByKind: Record<ComponentKind, VariantName[]> = {
  [ComponentKind.Verify]: ['modal', 'drawer'],
  [ComponentKind.VerifyButton]: ['inline'],
  [ComponentKind.Form]: ['modal', 'drawer', 'inline'],
  [ComponentKind.Render]: ['inline'],
};

const checkIsVariantValid = (kind: ComponentKind, variant?: any) => {
  if (!variant) {
    return;
  }

  const supportedVariants = VariantsByKind[kind] ?? [];
  const isSupported = () => {
    if (variant === 'modal' || variant === 'drawer') {
      return supportedVariants.includes(variant);
    }
    return !!variant.containerId && supportedVariants.includes('inline');
  };

  const isValid = isSupported();
  if (!isValid) {
    throw new Error(
      `Invalid variant: ${variant}. Valid variants for ${kind} are ${supportedVariants.join(
        ', ',
      )}`,
    );
  }
};

export default checkIsVariantValid;
