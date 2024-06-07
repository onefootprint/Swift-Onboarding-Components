import { ComponentKind } from '../types/components';
import type { CallbackKeys } from '../types/events';
import { PublicEvent } from '../types/events';

export const ComponentCallbacksByEvent: Record<ComponentKind, Partial<Record<PublicEvent, CallbackKeys>>> = {
  [ComponentKind.Auth]: {
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.UpdateLoginMethods]: {
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Form]: {
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Verify]: {
    [PublicEvent.auth]: 'onAuth',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Components]: {
    [PublicEvent.auth]: 'onAuth',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
    [PublicEvent.relayToComponents]: 'onRelayToComponents',
  },
  [ComponentKind.VerifyButton]: {
    [PublicEvent.auth]: 'onAuth',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.clicked]: 'onClick',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Render]: {},
};

export const RequiredCallbacksByComponent: Record<ComponentKind, string[]> = {
  [ComponentKind.Auth]: [],
  [ComponentKind.Form]: [],
  [ComponentKind.Render]: [],
  [ComponentKind.UpdateLoginMethods]: [],
  [ComponentKind.Verify]: [],
  [ComponentKind.Components]: [],
  [ComponentKind.VerifyButton]: [],
};
