// Events sent from child -> parent -> (optional) tenant that
// correspond to callbacks from the tenant
export enum PublicEvent {
  closed = 'closed',
  canceled = 'canceled',
  completed = 'completed',
  clicked = 'clicked',
}

// Events sent from parent -> child or parent <- child
export enum PrivateEvent {
  propsReceived = 'propsReceived',
  started = 'started',
  formSaved = 'formSaved', // triggered by tenant
  formSaveComplete = 'formSaveComplete', // triggered by form when save is complete
}
