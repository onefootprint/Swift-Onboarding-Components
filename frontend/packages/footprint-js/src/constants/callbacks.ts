import { ComponentKind } from '../types/components';
import { PublicEvent } from '../types/events';

export const ComponentCallbacksByEvent: Record<
  ComponentKind,
  Partial<
    Record<PublicEvent, 'onCancel' | 'onClick' | 'onClose' | 'onComplete'>
  >
> = {
  [ComponentKind.Auth]: {
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
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.VerifyButton]: {
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
  [ComponentKind.Verify]: [],
  [ComponentKind.VerifyButton]: [],
};
