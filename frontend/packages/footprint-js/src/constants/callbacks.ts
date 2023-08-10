import { ComponentKind } from '../types/components';
import { PublicEvent } from '../types/events';

export const ComponentCallbacksByEvent: Record<
  ComponentKind,
  Partial<Record<PublicEvent, string>>
> = {
  [ComponentKind.Form]: {
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Verify]: {
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.VerifyButton]: {
    [PublicEvent.clicked]: 'onClick',
    [PublicEvent.closed]: 'onClose',
    [PublicEvent.canceled]: 'onCancel',
    [PublicEvent.completed]: 'onComplete',
  },
  [ComponentKind.Render]: {},
};

export const RequiredCallbacksByComponent: Record<ComponentKind, string[]> = {
  [ComponentKind.Form]: [],
  [ComponentKind.Verify]: [],
  [ComponentKind.Render]: [],
  [ComponentKind.VerifyButton]: [],
};
