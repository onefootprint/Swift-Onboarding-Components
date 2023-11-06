import { ComponentCallbacksByEvent } from '../constants/callbacks';
import RefsByComponent from '../constants/refs';
import type {
  AuthProps,
  FormProps,
  Props,
  RenderProps,
  Variant,
  VerifyButtonProps,
  VerifyProps,
} from '../types/components';
import { ComponentKind } from '../types/components';
import { PublicEvent } from '../types/events';

type CallbackKeys = 'onCancel' | 'onClick' | 'onClose' | 'onComplete';
type ExtractOnProps<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: Function;
};

type PossibleCallbacks = ExtractOnProps<AuthProps> &
  ExtractOnProps<FormProps> &
  ExtractOnProps<RenderProps> &
  ExtractOnProps<VerifyButtonProps> &
  ExtractOnProps<VerifyProps>;

const VariantsByKind: Record<ComponentKind, Variant[]> = {
  [ComponentKind.Auth]: ['modal', 'drawer'],
  [ComponentKind.Form]: ['inline', 'modal', 'drawer'],
  [ComponentKind.Render]: ['inline'],
  [ComponentKind.Verify]: ['modal', 'drawer'],
  [ComponentKind.VerifyButton]: ['inline'],
};

const publicEventList: PublicEvent[] = Object.values(PublicEvent);
const noop = (...args: unknown[]) => undefined; // eslint-disable-line @typescript-eslint/no-unused-vars

const validateContainerIdForVariant = (
  variant: Variant,
  containerId?: string,
): void | never => {
  if (variant === 'inline' && !containerId) {
    throw new Error(
      `Inline component requires a containerId. Received ${containerId}`,
    );
  }
};

export const validateComponentVariant = (
  kind: ComponentKind,
  variant?: Variant,
): void | never => {
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

export const getDefaultVariantForKind = (
  kind: ComponentKind,
): Variant | never => {
  const supportedVariants = VariantsByKind[kind] ?? [];
  if (!supportedVariants.length) {
    throw new Error(`Invalid kind: ${kind}`);
  }
  return supportedVariants[0];
};

export const validateComponentKind = (kind: ComponentKind): void | never => {
  if (!kind) {
    throw new Error('Kind is required');
  }
  const validKinds = Object.values(ComponentKind);
  const isValid = validKinds.includes(kind);
  if (!isValid) {
    throw new Error(
      `Invalid kind: ${kind}. Valid kinds are: ${validKinds.join(', ')}`,
    );
  }
};

export const transformVerifyButtonProps = (props: Props): Props | undefined => {
  if (props.kind === ComponentKind.VerifyButton) {
    const {
      kind,
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

export const getRefProps = ({ kind }: Props) => RefsByComponent[kind] ?? [];

export const getCallbackFunction = (
  obj: PossibleCallbacks,
  key: CallbackKeys,
) => {
  const callbackFunction =
    Object.prototype.hasOwnProperty.call(obj, key) &&
    typeof obj[key] === 'function'
      ? obj[key]
      : undefined;

  return callbackFunction || noop;
};

/**
 * Certain callbacks need to destroy the iframe, and others might trigger
 * a secondary iframe to launch, like a new modal when a button is clicked
 */
export const getCallbackProps = (
  props: Props,
  onDestroy?: () => void,
  onLaunchChild?: (secondaryProps: Props) => void,
): Partial<Record<PublicEvent, (callbackArgs?: unknown) => void>> => {
  const { kind } = props;
  const callbacks = ComponentCallbacksByEvent[kind] ?? {};
  const modifiedCallbacks: Partial<Record<PublicEvent, () => void>> = {};
  const secondaryProps = transformVerifyButtonProps(props);

  Object.entries(callbacks).forEach(([event, callbackPropName]) => {
    const publicEvent = event as PublicEvent;
    if (!publicEventList.includes(publicEvent)) {
      return;
    }

    // Even if the user didn't specify a callback, we might still
    // need to listen for events that should trigger other things
    const callback = getCallbackFunction(props, callbackPropName);
    const shouldDestroy =
      publicEvent === PublicEvent.closed ||
      publicEvent === PublicEvent.canceled;

    const shouldLaunchChild =
      kind === ComponentKind.VerifyButton &&
      publicEvent === PublicEvent.clicked;

    // Make sure to pass any callback arguments through
    modifiedCallbacks[publicEvent] = (callbackArgs?: unknown) => {
      callback(callbackArgs);
      if (shouldDestroy) {
        onDestroy?.();
      }
      if (shouldLaunchChild && secondaryProps) {
        onLaunchChild?.(secondaryProps);
      }
    };
  });

  return modifiedCallbacks;
};

/**
 * Get the data props that will be sent over via post messages to the child iframe
 * We need to omit kind, appearance, ref and callback props from the props sent to the iframe
 * Functions cannot be sent via post message and appearance is already sent via URL
 */
export const omitCallbacksAndRefs = (props: Props): Partial<Props> => {
  const { kind, appearance, containerId, ...rest } = props;
  const callbacks = ComponentCallbacksByEvent[kind] ?? {};
  const callbackPropNames = Object.values(callbacks);

  const refs = getRefProps(props);
  const refPropNames = Object.values(refs);

  return Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) =>
        !callbackPropNames.includes(key as CallbackKeys) &&
        !refPropNames.includes(key),
    ),
  );
};

export const sanitizeAndValidateProps = (props: Props): Props => {
  const { kind, variant: rawVariant, containerId } = props;
  const variant = rawVariant || getDefaultVariantForKind(kind);
  validateComponentKind(kind);
  validateComponentVariant(kind, rawVariant);
  validateContainerIdForVariant(variant, containerId);

  return {
    ...props,
    variant,
  } as Props;
};
