// Events sent from child -> parent -> (optional) tenant that
// correspond to callbacks from the tenant
export enum PublicEvent {
  canceled = 'canceled',
  clicked = 'clicked',
  closed = 'closed',
  completed = 'completed',
}

// Events sent from parent -> child or parent <- child
export enum PrivateEvent {
  formSaveComplete = 'formSaveComplete', // triggered by form when save is complete, to resolve the promise
  formSaveFailed = 'formSaveFailed', // triggered by form when save fails, to reject the promise
  formSaved = 'formSaved', // triggered by tenant to save the form via ref
  propsReceived = 'propsReceived',
  started = 'started',
}
