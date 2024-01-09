import { FPCustomEvents, isCustomEvent } from '../../../custom-event';

type Payload = {
  type: 'authTokenChanged';
  payload: { authToken: string };
};

/**
 * Creates a payload for the 'authTokenChanged' event based on the provided Event.
 *
 * @param {Event} e - The Event object to extract information from.
 * @returns {Payload | undefined} - The payload for 'authTokenChanged' event,
 *                                  or undefined if the event does not meet the criteria.
 */
const createAuthTokenChangedPayload = (e: Event): Payload | undefined => {
  if (e.type !== FPCustomEvents.stepUpCompleted) return undefined;
  if (!isCustomEvent<{ authToken: string }>(e)) return undefined;
  if (!e.detail) return undefined;

  return {
    type: 'authTokenChanged',
    payload: { authToken: e.detail.authToken },
  };
};

export default createAuthTokenChangedPayload;
