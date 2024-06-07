// Events sent from child -> parent -> (optional) tenant that
// correspond to callbacks from the tenant
export enum PublicEvent {
  auth = 'auth',
  canceled = 'canceled',
  clicked = 'clicked',
  closed = 'closed',
  completed = 'completed',
  relayToComponents = 'relayToComponents',
}

// Events sent from parent -> child or parent <- child
export enum PrivateEvent {
  formSaveComplete = 'formSaveComplete', // triggered by form when save is complete, to resolve the promise
  formSaveFailed = 'formSaveFailed', // triggered by form when save fails, to reject the promise
  formSaved = 'formSaved', // triggered by tenant to save the form via ref
  propsReceived = 'propsReceived',
  started = 'started',
  relayFromComponents = 'relayFromComponents',
}

export type CallbackKeys = 'onAuth' | 'onCancel' | 'onClick' | 'onClose' | 'onComplete' | 'onRelayToComponents';

export type ExtractOnProps<T> = {
  [K in keyof T as K extends `on${string}` ? K : never]: Function;
};
