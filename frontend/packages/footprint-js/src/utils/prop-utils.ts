import { ComponentCallbacksByEvent } from '../constants/callbacks';
import RefsByComponent from '../constants/refs';
import {
  ComponentKind,
  Props,
  Variant,
  VerifyProps,
} from '../types/components';
import { PublicEvent } from '../types/events';

const VariantsByKind: Record<ComponentKind, Variant[]> = {
  [ComponentKind.Verify]: ['modal', 'drawer'],
  [ComponentKind.VerifyButton]: ['inline'],
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

export const checkIsKindValid = (kind: ComponentKind) => {
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

export const checkIsContainerIdValid = (
  variant: Variant,
  containerId?: string,
) => {
  if (variant === 'inline' && !containerId) {
    throw new Error(
      `Inline component requires a containerId. Received ${containerId}`,
    );
  }
};

const getSecondaryProps = (props: Props): Props | undefined => {
  const { kind } = props;
  if (kind === ComponentKind.VerifyButton) {
    const {
      kind: buttonKind,
      appearance,
      variant,
      dialogVariant,
      onClick,
      label,
      containerId,
      ...restProps
    } = props;
    return {
      ...restProps,
      variant: dialogVariant,
      kind: ComponentKind.Verify,
    } as VerifyProps;
  }

  return undefined;
};

export const getRefProps = (props: Props) => {
  const { kind } = props;
  const refs = RefsByComponent[kind] ?? [];
  return refs;
};

// Certain callbacks need to destroy the iframe, and others might trigger a
// secondary iframe to launch, like a new modal when a button is clicked
export const getCallbackProps = (
  props: Props,
  onDestroy?: () => void,
  onLaunchChild?: (secondaryProps: Props) => void,
): Partial<Record<PublicEvent, () => void>> => {
  const { kind } = props;
  const callbacks = ComponentCallbacksByEvent[kind] ?? {};
  const modifiedCallbacks: Partial<Record<PublicEvent, () => void>> = {};

  Object.entries(callbacks).forEach(([event, callbackPropName]) => {
    const publicEvent = event as PublicEvent;
    if (!Object.values(PublicEvent).includes(publicEvent)) {
      return;
    }

    // Even if the user didn't specify a callback, we might still
    // need to listen for events that should trigger other things
    let callback = (props as any)[callbackPropName];
    if (!callback || typeof callback !== 'function') {
      callback = () => {};
    }

    const shouldDestroy =
      publicEvent === PublicEvent.closed ||
      publicEvent === PublicEvent.canceled;

    const shouldLaunchChild =
      kind === ComponentKind.VerifyButton &&
      publicEvent === PublicEvent.clicked;

    modifiedCallbacks[publicEvent] = () => {
      callback();
      if (shouldDestroy) {
        onDestroy?.();
      }
      const secondaryProps = getSecondaryProps(props);
      if (shouldLaunchChild && secondaryProps) {
        onLaunchChild?.(secondaryProps);
      }
    };
  });

  return modifiedCallbacks;
};

// Get the data props that will be sent over via post messages to the child iframe
// We need to omit kind, appearance, ref and callback props from the props sent to the iframe
// Functions cannot be sent via post message and appearance is already sent via URL
export const getDataProps = (props: Props): Partial<Props> => {
  const { kind, appearance, containerId, ...customProps } = props;
  const callbacks = ComponentCallbacksByEvent[kind] ?? {};
  const callbackPropNames = Object.values(callbacks);

  const refs = getRefProps(props);
  const refPropNames = Object.values(refs);

  const dataProps = Object.fromEntries(
    Object.entries(customProps).filter(
      ([key]) =>
        !callbackPropNames.includes(key) && !refPropNames.includes(key),
    ),
  );

  return dataProps;
};

export const getSanitizedProps = (props: Props): Props => {
  const { kind, variant: rawVariant, containerId } = props;
  checkIsKindValid(kind);
  checkIsVariantValid(kind, rawVariant);
  const variant = rawVariant || getDefaultVariantForKind(kind);
  checkIsContainerIdValid(variant, containerId);

  return {
    ...props,
    variant,
  } as Props;
};
