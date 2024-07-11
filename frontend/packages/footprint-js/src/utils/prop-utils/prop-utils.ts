import { ComponentCallbacksByEvent } from '../../constants/callbacks';
import RefsByComponent from '../../constants/refs';
import type {
  AuthProps,
  ComponentsSdkProps,
  FormProps,
  Props,
  RenderProps,
  Variant,
  VerifyButtonProps,
  VerifyProps,
} from '../../types/components';
import { ComponentKind } from '../../types/components';
import type { CallbackKeys, ExtractOnProps } from '../../types/events';
import { PublicEvent } from '../../types/events';

type Obj = Record<string, unknown>;
type PossibleCallbacks = ExtractOnProps<AuthProps> &
  ExtractOnProps<FormProps> &
  ExtractOnProps<RenderProps> &
  ExtractOnProps<VerifyButtonProps> &
  ExtractOnProps<VerifyProps> &
  ExtractOnProps<ComponentsSdkProps>;

const VariantsByKind: Record<ComponentKind, Variant[]> = {
  [ComponentKind.Auth]: ['modal', 'drawer'],
  [ComponentKind.Components]: ['modal'],
  [ComponentKind.Form]: ['inline', 'modal', 'drawer'],
  [ComponentKind.Render]: ['inline'],
  [ComponentKind.UpdateLoginMethods]: ['modal', 'drawer'],
  [ComponentKind.Verify]: ['modal', 'drawer'],
  [ComponentKind.VerifyButton]: ['inline'],
};

const publicEventList: PublicEvent[] = Object.values(PublicEvent);
const noop = (..._args: unknown[]) => undefined;

export const isObject = (o: unknown): o is Obj => o != null && typeof o === 'object' && !Array.isArray(o);

const hasObjKeys = (o: unknown): o is Obj => isObject(o) && Object.keys(o).length > 0;

const validateContainerIdForVariant = (variant: Variant, containerId?: string): void | never => {
  if (variant === 'inline' && !containerId) {
    throw new Error(`Inline component requires a containerId. Received ${containerId}`);
  }
};

export const validateComponentVariant = (kind: `${ComponentKind}`, variant?: Variant): void | never => {
  if (!variant) {
    return;
  }

  const supportedVariants = VariantsByKind[kind] ?? [];
  const isValid = supportedVariants.includes(variant);
  if (!isValid) {
    throw new Error(
      `Invalid variant: ${JSON.stringify(variant)}. Valid variants for ${kind} are ${supportedVariants.join(', ')}`,
    );
  }
};

export const getDefaultVariantForKind = (kind: `${ComponentKind}`): Variant | never => {
  const supportedVariants = VariantsByKind[kind] ?? [];
  if (!supportedVariants.length) {
    throw new Error(`Invalid kind: ${kind}`);
  }
  return supportedVariants[0];
};

export const validateComponentKind = (kind: `${ComponentKind}`): void | never => {
  if (!kind) {
    throw new Error('Kind is required');
  }
  const validKinds = Object.values(ComponentKind);
  const isValid = validKinds.includes(kind as ComponentKind);
  if (!isValid) {
    throw new Error(`Invalid kind: ${kind}. Valid kinds are: ${validKinds.join(', ')}`);
  }
};

export const transformVerifyButtonProps = (props: Props): Props | undefined => {
  if (props.kind === ComponentKind.VerifyButton) {
    const { kind, appearance, variant, dialogVariant, onClick, label, containerId, ...restProps } = props;
    return {
      ...restProps,
      variant: dialogVariant,
      kind: ComponentKind.Verify,
    } as VerifyProps;
  }

  return undefined;
};

export const getRefProps = ({ kind }: Props) => RefsByComponent[kind] ?? [];

export const getCallbackFunction = (obj: PossibleCallbacks, key: CallbackKeys) => {
  const callbackFunction =
    Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === 'function' ? obj[key] : undefined;

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
    const shouldDestroy = publicEvent === PublicEvent.closed || publicEvent === PublicEvent.canceled;

    const shouldLaunchChild = kind === ComponentKind.VerifyButton && publicEvent === PublicEvent.clicked;

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

export const sanitizeAndValidateProps = (props: Props): Props => {
  const { kind, variant: rawVariant, containerId } = props;
  const variant = rawVariant || getDefaultVariantForKind(kind);
  validateComponentKind(kind);
  validateComponentVariant(kind, rawVariant);
  validateContainerIdForVariant(variant, containerId);

  // @ts-expect-error: userData is deprecated, cleanup ticket FP-7845
  if (hasObjKeys(props?.userData)) {
    console.warn(
      'userData is deprecated and will be removed in the next major version. Please use bootstrapData instead.',
    );
  }

  return {
    ...props,
    variant,
  } as Props;
};

export const getBootstrapData = (obj: { bootstrapData?: Obj; userData?: Obj }): { userData: Obj } | undefined => {
  return hasObjKeys(obj?.bootstrapData) /** First check for bootstrapData */
    ? { userData: obj.bootstrapData }
    : hasObjKeys(obj?.userData) /** Then check for userData */
      ? { userData: obj.userData }
      : undefined;
};
